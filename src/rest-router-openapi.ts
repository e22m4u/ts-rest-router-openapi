import {Flatten} from './types.js';
import {Errorf} from '@e22m4u/js-format';
import {Service} from '@e22m4u/js-service';
import {cloneDeep} from './utils/index.js';
import {deepAssign} from './utils/index.js';
import {DataType} from '@e22m4u/ts-data-schema';
import {DataSchema} from '@e22m4u/ts-data-schema';
import {dataSchemaToOASchemaObject} from './utils/index.js';
import {OAVisibilityReflector} from './decorators/index.js';
import {convertExpressPathToOpenAPI} from './utils/index.js';

import {
  OADataType,
  OADocumentObject,
  OAMediaType,
  OAMediaTypeObject,
  OAOperationMethod,
  OAOperationObject,
  OAParameterLocation,
  OAParameterObject,
  OARequestBodyObject,
  OARequestBodyReflector,
  OAResponseObject,
  OAResponseReflector,
} from '@e22m4u/ts-openapi';

import {
  ControllerRegistry,
  RequestDataReflector,
  RequestDataSource,
  ResponseBodyReflector,
  RestActionReflector,
  RestControllerReflector,
  RestRouter,
} from '@e22m4u/ts-rest-router';

/**
 * OpenAPI version.
 */
export const OPENAPI_VERSION = '3.1.0';

/**
 * RequestDataSource to OAParameterLocation.
 */
const REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP = new Map([
  [RequestDataSource.PARAMS, OAParameterLocation.PATH],
  [RequestDataSource.QUERY, OAParameterLocation.QUERY],
  [RequestDataSource.HEADERS, OAParameterLocation.HEADER],
  [RequestDataSource.COOKIE, OAParameterLocation.COOKIE],
]);

/**
 * DataType to OAMediaType.
 */
const DATA_TYPE_TO_OA_MEDIA_TYPE = new Map([
  [DataType.ANY, OAMediaType.TEXT_PLAIN],
  [DataType.STRING, OAMediaType.TEXT_PLAIN],
  [DataType.NUMBER, OAMediaType.APPLICATION_JSON],
  [DataType.BOOLEAN, OAMediaType.APPLICATION_JSON],
  [DataType.ARRAY, OAMediaType.APPLICATION_JSON],
  [DataType.OBJECT, OAMediaType.APPLICATION_JSON],
]);

/**
 * OpenAPI to RestRouter integration service.
 */
export class RestRouterOpenAPI extends Service {
  /**
   * Constructor.
   */
  constructor() {
    // запрет передачи контейнера в качестве первого
    // аргумента данного сервиса
    super();
  }

  /**
   * Добавляет параметр в операцию.
   *
   * @param oaOperation
   * @param paramName
   * @param oaLocation
   * @param paramSchema
   * @protected
   */
  protected addParameterToOAOperation(
    oaOperation: OAOperationObject,
    paramName: string,
    oaLocation: OAParameterLocation,
    paramSchema: DataSchema | undefined,
  ): void {
    // чтобы избежать перезаписи одинаковых параметров
    // добавленных из разных мета-данных, выполняется
    // поиск существующего параметра, а при его наличии
    // выполняется расширение текущими данными
    const existingOAParameter = (
      oaOperation.parameters as OAParameterObject[]
    ).find(oap => {
      return oap.name === paramName && oap.in === oaLocation;
    });
    const oaParameter: OAParameterObject = existingOAParameter || {
      name: paramName,
      in: oaLocation,
      explode: false,
    };
    if (paramSchema) {
      // для схемы используется "application/json"
      const oaMediaTypeObject: OAMediaTypeObject = {};
      oaParameter.content = {[OAMediaType.APPLICATION_JSON]: oaMediaTypeObject};
      // для свойства тип ANY меняется на STRING,
      // так как ANY в OpenAPI не представлен
      if (paramSchema.type === DataType.ANY) {
        oaMediaTypeObject.schema = dataSchemaToOASchemaObject({
          ...paramSchema,
          type: DataType.STRING,
        });
      }
      // остальные тип (кроме ANY)
      // остаются без изменений
      else if (paramSchema.type != null) {
        oaMediaTypeObject.schema = dataSchemaToOASchemaObject(paramSchema);
      }
      // если опция required определена,
      // то ее значение передается параметру
      // с приведением к логическому типу
      if (paramSchema.required != null)
        oaParameter.required = Boolean(paramSchema.required);
    }
    // если источником является путь запроса,
    // то значение опции required
    // переопределяется на true
    if (oaLocation === OAParameterLocation.PATH) oaParameter.required = true;
    // если существующий параметр не найден,
    // то добавляется новый
    if (!existingOAParameter) {
      oaOperation.parameters = oaOperation.parameters || [];
      oaOperation.parameters.push(oaParameter);
    }
  }

  /**
   * Generate OpenAPI documentation.
   *
   * @param doc
   */
  genOpenAPIDocument(doc: Flatten<Omit<OADocumentObject, 'openapi'>>) {
    if (!this.hasService(RestRouter))
      throw new Errorf(
        'A RestRouter instance must be registered ' +
          'in the RestRouterOpenAPI service.',
      );
    const router = this.getService(RestRouter);
    doc = cloneDeep({...doc, openapi: OPENAPI_VERSION});
    const controllerMap = router.getService(ControllerRegistry).controllerMap;
    const controllers = Array.from(controllerMap.keys());
    const existingTagNames = new Set(doc.tags?.map(t => t.name) ?? []);
    for (const cls of controllers) {
      const controllerMd = RestControllerReflector.getMetadata(cls);
      if (!controllerMd)
        throw new Errorf(
          'Controller class %s does not have metadata.',
          cls.name,
        );
      // формирование тега
      const tagName = !/^Controller$/i.test(cls.name)
        ? cls.name.replace(/Controller$/i, '')
        : cls.name;
      // формирование операций
      // (декораторы @restAction)
      const actionsMd = RestActionReflector.getMetadata(cls);
      const tagPath = (controllerMd.path ?? '')
        .replace(/(^\/+|\/+$)/, '')
        .replace(/\/+/g, '/');
      const responseBodyMdMap = ResponseBodyReflector.getMetadata(cls);
      const requestBodiesMdMap = OARequestBodyReflector.getMetadata(cls);
      const controllerRootOptions = controllerMap.get(cls);
      // операция может быть скрыта с использованием
      // мета-данных OAVisibility, установленных
      // классу-контроллеру или его методу
      const tagVisibilityMd = OAVisibilityReflector.getMetadata(cls);
      const isTagVisible = tagVisibilityMd?.visible;
      let tagOperationsCounter = 0;
      for (const [actionName, actionMd] of actionsMd.entries()) {
        // если значение видимости данного метода явно
        // установлено как `false`, то метод исключается
        // из OpenAPI схемы
        const opVisibilityMd = OAVisibilityReflector.getMetadata(
          cls,
          actionName,
        );
        const isOperationVisible = opVisibilityMd?.visible;
        if (isOperationVisible === false) continue;
        // если значение видимости данного класса явно установлено
        // как `false`, но значение видимости для текущего метода
        // не является `true`, то метод исключается из OpenAPI схемы
        if (isTagVisible === false && isOperationVisible !== true) continue;
        // сохранение количества операций текущего тега для проверки
        // необходимости его удаления из списка тегов по причине
        // отсутствия операций
        tagOperationsCounter++;
        // формирование операции
        // (декоратор @restAction)
        const oaOperation: OAOperationObject = {tags: [tagName]};
        const rootPathPrefix = controllerRootOptions?.pathPrefix ?? '';
        const operationPath = (actionMd.path ?? '')
          .replace(/(^\/+|\/+$)/, '')
          .replace(/\/+/g, '/');
        const fullOperationPath =
          `/${rootPathPrefix}/${tagPath}/${operationPath}`
            .replace(/\/+$/, '')
            .replace(/\/+/g, '/') || '/';
        const oaOperationPath = convertExpressPathToOpenAPI(fullOperationPath);
        doc.paths = doc.paths ?? {};
        doc.paths[oaOperationPath] = doc.paths[oaOperationPath] ?? {};
        const oaPathItem = doc.paths[oaOperationPath]!;
        const oaOperationMethod =
          actionMd.method.toLowerCase() as OAOperationMethod;
        oaPathItem[oaOperationMethod] = oaOperation;
        // формирование параметров
        // (декоратор @requestData)
        const requestDataMdMap = RequestDataReflector.getMetadata(
          cls,
          actionName,
        );
        const requestDataMds = Array.from(requestDataMdMap.values()).reverse();
        for (const requestDataMd of requestDataMds) {
          oaOperation.parameters = oaOperation.parameters ?? [];
          // извлечение схемы данных запроса из фабрики
          // (если определена) или исходного значения
          let requestDataSchema: DataSchema | undefined;
          if (typeof requestDataMd.schema === 'function') {
            requestDataSchema = requestDataMd.schema(this.container);
          } else {
            requestDataSchema = requestDataMd.schema;
          }
          // определенный параметр источника:
          // PATH, QUERY, HEADER, COOKIE
          // (пропускаются типы отличные от OBJECT)
          if (
            REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(
              requestDataMd.source,
            ) &&
            requestDataSchema &&
            requestDataSchema.type === DataType.OBJECT &&
            requestDataSchema.properties &&
            typeof requestDataSchema.properties === 'object' &&
            Object.keys(requestDataSchema.properties).length &&
            requestDataMd.property
          ) {
            const oaLocation = REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(
              requestDataMd.source,
            )!;
            const paramSchema =
              (requestDataSchema &&
                typeof requestDataSchema === 'object' &&
                requestDataSchema.properties &&
                typeof requestDataSchema.properties === 'object' &&
                requestDataSchema.properties[requestDataMd.property] &&
                typeof requestDataSchema.properties[requestDataMd.property] ===
                  'object' &&
                requestDataSchema.properties[requestDataMd.property]) ||
              undefined;
            // добавление параметра в операцию,
            // включая схему (при наличии)
            this.addParameterToOAOperation(
              oaOperation,
              requestDataMd.property,
              oaLocation,
              paramSchema,
            );
          }
          // все параметры источника:
          // PATH, QUERY, HEADER, COOKIE
          // (пропускаются типы отличные от OBJECT)
          else if (
            REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(
              requestDataMd.source,
            ) &&
            requestDataSchema &&
            requestDataSchema.type === DataType.OBJECT &&
            requestDataSchema.properties &&
            typeof requestDataSchema.properties === 'object' &&
            Object.keys(requestDataSchema.properties).length
          ) {
            const oaLocation = REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(
              requestDataMd.source,
            )!;
            const propsSchemaEntries = Object.entries(
              requestDataSchema.properties,
            );
            for (const [paramName, paramSchema] of propsSchemaEntries) {
              // добавление параметра в операцию,
              // включая схему (при наличии)
              this.addParameterToOAOperation(
                oaOperation,
                paramName,
                oaLocation,
                paramSchema,
              );
            }
          }
          // формирование тела запроса
          // (декоратор @requestBody)
          else if (requestDataMd.source === RequestDataSource.BODY) {
            const dataType = requestDataSchema?.type || DataType.ANY;
            // если тело запроса имеет тип ANY или STRING,
            // то тело будет представлено как text/plain
            const oaMediaType = DATA_TYPE_TO_OA_MEDIA_TYPE.get(dataType);
            // если MIME для указанного DataType
            // не определен, то выбрасывается ошибка
            if (!oaMediaType)
              throw new Errorf('MIME of %v is not defined.', dataType);
            // поиск существующего объекта запроса,
            // или создание нового объекта
            oaOperation.requestBody = oaOperation.requestBody || {content: {}};
            const oaBodyObject = oaOperation.requestBody as OARequestBodyObject;
            const oaBodyContent = oaBodyObject.content || {};
            oaBodyContent[oaMediaType] = oaBodyContent[oaMediaType] || {};
            const oaMediaObject = oaBodyContent[oaMediaType];
            // по умолчанию используется тип STRING,
            // так как DataType.ANY дает text/plain
            const defaultOASchema = {type: OADataType.STRING};
            oaMediaObject.schema = oaMediaObject.schema || defaultOASchema;
            const existingOASchema = oaMediaObject.schema;
            // формирование схемы данных, используя STRING
            // как значение по умолчанию (вместо ANY)
            const oaSchema = dataSchemaToOASchemaObject(
              {...requestDataSchema, type: dataType},
              OADataType.STRING,
            );
            // если тип данных определен как OBJECT
            if (dataType === DataType.OBJECT) {
              // если существующая схема тела запроса так же
              // как и текущая схема имеет тип OBJECT, то выполняется
              // включение свойств из текущей схемы в существующую
              if (existingOASchema.type === OADataType.OBJECT) {
                deepAssign(existingOASchema, oaSchema);
              }
              // если существующая схема тела запроса имеет
              // тип отличный от OBJECT, то выполняется
              // ее перезапись текущей схемой
              else {
                oaMediaObject.schema = oaSchema;
              }
              // удаление свойств, содержащих вместо
              // схемы undefined или пустой объект
              if (oaMediaObject.schema && oaMediaObject.schema.properties) {
                const oaSchemaProps = oaMediaObject.schema.properties;
                for (const [propName, propValue] of Object.entries(
                  oaSchemaProps,
                )) {
                  if (!propValue || !Object.keys(propValue).length)
                    delete oaSchemaProps[propName];
                }
                // удаление свойства properties, если оно
                // содержит пустой объект или undefined
                if (!Object.keys(oaSchemaProps).length)
                  delete oaMediaObject.schema.properties;
              }
            }
            // если текущая схема имеет тип отличный
            // от OBJECT и ANY, то выполняется перезапись
            // существующей схемы
            else if (dataType !== DataType.ANY) {
              // перезапись существующей схемы выполняется
              // только если текущая схема определена
              if (oaSchema) {
                oaMediaObject.schema = oaSchema;
              }
            }
            // если опция required определена, то ее значение
            // передается схеме тела запроса с приведением
            // к логическому типу
            if (requestDataSchema?.required != null)
              oaBodyObject.required = Boolean(requestDataSchema.required);
          }
          // если параметры операции не определены,
          // то свойство `parameters` удаляется
          if (!oaOperation.parameters.length) delete oaOperation.parameters;
        }
        // формирование тела ответа
        // (декоратор @responseBody)
        const responseBodyMd = responseBodyMdMap.get(actionName);
        if (responseBodyMd && responseBodyMd.schema) {
          // извлечение схемы тела ответа из фабрики
          // (если определена) или исходного значения
          let responseBodySchema: DataSchema | undefined;
          if (typeof responseBodyMd.schema === 'function') {
            responseBodySchema = responseBodyMd.schema(this.container);
          } else {
            responseBodySchema = responseBodyMd.schema;
          }
          // если схему тела ответа определена, или схему удалось
          // извлечь из фабрики, то формируется OpenAPI схема
          if (responseBodySchema) {
            const dataType = responseBodySchema.type || DataType.ANY;
            // если тело ответа имеет тип ANY или STRING,
            // то тело будет представлено как text/plain
            const oaMediaType = DATA_TYPE_TO_OA_MEDIA_TYPE.get(dataType);
            // если MIME для указанного DataType
            // не определен, то выбрасывается ошибка
            if (!oaMediaType)
              throw new Errorf('MIME of %v is not defined.', dataType);
            // поиск существующего объекта запроса,
            // или создание нового объекта
            oaOperation.responses = oaOperation.responses ?? {};
            const oaResponses = oaOperation.responses!;
            oaResponses.default = oaResponses.default || {
              description: 'Example',
              content: {},
            };
            const oaResponse = oaResponses.default as OAResponseObject;
            const oaMediaObject = oaResponse.content || {};
            // формирование схемы данных, используя STRING
            // как значение по умолчанию (вместо ANY)
            const oaSchema = dataSchemaToOASchemaObject(
              responseBodySchema,
              OADataType.STRING,
            );
            oaMediaObject[oaMediaType] = {schema: oaSchema};
          }
        }
        // поддержка OARequestBodyMetadata
        // (декоратор @oaRequestBody)
        const requestBodiesMd = requestBodiesMdMap.get(actionName);
        if (requestBodiesMd) {
          requestBodiesMd.reverse().forEach(requestBodyMd => {
            oaOperation.requestBody = oaOperation.requestBody ?? {
              description: requestBodyMd.description,
              content: {},
              required: requestBodyMd.required,
            };
            const oaRequestBody =
              oaOperation.requestBody as OARequestBodyObject;
            oaRequestBody.content[requestBodyMd.mediaType] = {
              schema: requestBodyMd.schema,
              example: requestBodyMd.example,
            };
          });
        }
        // поддержка OAResponseMetadata
        // (декоратор @oaResponse)
        const responsesMdMap = OAResponseReflector.getMetadata(cls);
        const responsesMd = responsesMdMap.get(actionName);
        if (responsesMd) {
          oaOperation.responses = oaOperation.responses ?? {};
          const oaResponses = oaOperation.responses;
          responsesMd.reverse().forEach(responseMd => {
            const statusCode = responseMd.statusCode
              ? String(responseMd.statusCode)
              : 'default';
            oaResponses[statusCode] = oaResponses[statusCode] ?? {
              description: responseMd.description,
            };
            const oaResponse = oaResponses[statusCode] as OAResponseObject;
            oaResponse.content = oaResponse.content ?? {};
            const oaContent = oaResponse.content;
            oaContent[responseMd.mediaType] = {
              schema: responseMd.schema,
              example: responseMd.example,
            };
          });
        }
      }
      // если тег имеет не менее одной операции,
      // то он добавляется в OpenAPI схему
      if (tagOperationsCounter) {
        if (!existingTagNames.has(tagName)) {
          doc.tags = doc.tags ?? [];
          doc.tags.push({name: tagName});
          existingTagNames.add(tagName);
        }
      }
    }
    return doc;
  }
}
