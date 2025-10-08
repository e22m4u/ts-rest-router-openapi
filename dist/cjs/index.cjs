"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dist/esm/index.js
var index_exports = {};
__export(index_exports, {
  OAVisibilityReflector: () => OAVisibilityReflector,
  OA_VISIBILITY_METADATA_KEY: () => OA_VISIBILITY_METADATA_KEY,
  OPENAPI_VERSION: () => OPENAPI_VERSION,
  RestRouterOpenAPI: () => RestRouterOpenAPI,
  dataSchemaToOASchemaObject: () => dataSchemaToOASchemaObject,
  oaHidden: () => oaHidden,
  oaVisibility: () => oaVisibility,
  oaVisible: () => oaVisible
});
module.exports = __toCommonJS(index_exports);

// dist/esm/decorators/visibility-metadata.js
var import_ts_reflector = require("@e22m4u/ts-reflector");
var OA_VISIBILITY_METADATA_KEY = new import_ts_reflector.MetadataKey("openApiVisibilityMetadataKey");

// dist/esm/decorators/visibility-decorator.js
var import_ts_reflector3 = require("@e22m4u/ts-reflector");
var import_ts_reflector4 = require("@e22m4u/ts-reflector");

// dist/esm/decorators/visibility-reflector.js
var import_ts_reflector2 = require("@e22m4u/ts-reflector");
var _OAVisibilityReflector = class _OAVisibilityReflector {
  /**
   * Set metadata.
   *
   * @param metadata
   * @param target
   * @param propertyKey
   */
  static setMetadata(metadata, target, propertyKey) {
    if (propertyKey) {
      import_ts_reflector2.Reflector.defineMetadata(OA_VISIBILITY_METADATA_KEY, metadata, target, propertyKey);
    } else {
      import_ts_reflector2.Reflector.defineMetadata(OA_VISIBILITY_METADATA_KEY, metadata, target);
    }
  }
  /**
   * Get metadata.
   *
   * @param target
   * @param propertyKey
   */
  static getMetadata(target, propertyKey) {
    if (propertyKey) {
      return import_ts_reflector2.Reflector.getOwnMetadata(OA_VISIBILITY_METADATA_KEY, target, propertyKey);
    }
    return import_ts_reflector2.Reflector.getOwnMetadata(OA_VISIBILITY_METADATA_KEY, target);
  }
};
__name(_OAVisibilityReflector, "OAVisibilityReflector");
var OAVisibilityReflector = _OAVisibilityReflector;

// dist/esm/decorators/visibility-decorator.js
function oaVisibility(visible) {
  return function(target, propertyKey, descriptor) {
    const decoratorType = (0, import_ts_reflector4.getDecoratorTargetType)(target, propertyKey, descriptor);
    if (decoratorType !== import_ts_reflector3.DecoratorTargetType.CONSTRUCTOR && decoratorType !== import_ts_reflector3.DecoratorTargetType.INSTANCE_METHOD) {
      throw new Error("@oaVisibility decorator is only supported on a class or an instance method.");
    }
    OAVisibilityReflector.setMetadata({ method: propertyKey, visible }, typeof target === "function" ? target : target.constructor, propertyKey);
  };
}
__name(oaVisibility, "oaVisibility");
function oaHidden() {
  return oaVisibility(false);
}
__name(oaHidden, "oaHidden");
function oaVisible() {
  return oaVisibility(true);
}
__name(oaVisible, "oaVisible");

// dist/esm/rest-router-openapi.js
var import_js_format10 = require("@e22m4u/js-format");
var import_js_service3 = require("@e22m4u/js-service");

// dist/esm/utils/clone-deep.js
function cloneDeep(value) {
  return JSON.parse(JSON.stringify(value));
}
__name(cloneDeep, "cloneDeep");

// dist/esm/utils/is-plain-object.js
function isPlainObject(input) {
  return !(input === null || typeof input !== "object" || Array.isArray(input) || input.constructor && input.constructor !== Object);
}
__name(isPlainObject, "isPlainObject");

// dist/esm/utils/deep-assign.js
function deepAssign(target, ...sources) {
  if (!sources.length) {
    return target;
  }
  const source = sources.shift();
  if (isPlainObject(target) && isPlainObject(source)) {
    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target[key];
        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
          deepAssign(targetValue, sourceValue);
        } else {
          target[key] = sourceValue;
        }
      }
    }
  } else {
    throw new Error("Arguments of deepAssign should be plain objects.");
  }
  if (sources.length > 0) {
    return deepAssign(target, ...sources);
  }
  return target;
}
__name(deepAssign, "deepAssign");

// dist/esm/utils/data-schema-to-oa-schema-object.js
var import_ts_openapi = require("@e22m4u/ts-openapi");

// node_modules/@e22m4u/ts-data-schema/dist/esm/data-schema.js
var DataType = {
  ANY: "any",
  STRING: "string",
  NUMBER: "number",
  BOOLEAN: "boolean",
  ARRAY: "array",
  OBJECT: "object"
};

// node_modules/@e22m4u/ts-data-schema/dist/esm/errors/type-cast-error.js
var import_js_format3 = require("@e22m4u/js-format");

// node_modules/@e22m4u/ts-data-schema/dist/esm/utils/get-data-schema-from-class.js
var import_js_format2 = require("@e22m4u/js-format");

// node_modules/@e22m4u/ts-data-schema/dist/esm/decorators/data-schema-metadata.js
var import_ts_reflector5 = require("@e22m4u/ts-reflector");
var DATA_SCHEMA_CLASS_METADATA_KEY = new import_ts_reflector5.MetadataKey("dataSchemaClassMetadataKey");
var DATA_SCHEMA_PROPERTIES_METADATA_KEY = new import_ts_reflector5.MetadataKey("dataSchemaPropertiesMetadataKey");

// node_modules/@e22m4u/ts-data-schema/dist/esm/decorators/data-schema-reflector.js
var import_ts_reflector6 = require("@e22m4u/ts-reflector");
var _DataSchemaReflector = class _DataSchemaReflector {
  /**
   * Set metadata.
   *
   * @param metadata
   * @param target
   * @param propertyKey
   */
  static setMetadata(metadata, target, propertyKey) {
    if (propertyKey == null) {
      import_ts_reflector6.Reflector.defineMetadata(DATA_SCHEMA_CLASS_METADATA_KEY, metadata, target);
    } else {
      const oldMap = import_ts_reflector6.Reflector.getOwnMetadata(DATA_SCHEMA_PROPERTIES_METADATA_KEY, target);
      const newMap = new Map(oldMap);
      newMap.set(propertyKey, metadata);
      import_ts_reflector6.Reflector.defineMetadata(DATA_SCHEMA_PROPERTIES_METADATA_KEY, newMap, target);
    }
  }
  /**
   * Get class metadata.
   *
   * @param target
   */
  static getClassMetadata(target) {
    return import_ts_reflector6.Reflector.getOwnMetadata(DATA_SCHEMA_CLASS_METADATA_KEY, target);
  }
  /**
   * Get properties metadata.
   *
   * @param target
   */
  static getPropertiesMetadata(target) {
    const metadata = import_ts_reflector6.Reflector.getOwnMetadata(DATA_SCHEMA_PROPERTIES_METADATA_KEY, target);
    return metadata != null ? metadata : /* @__PURE__ */ new Map();
  }
};
__name(_DataSchemaReflector, "DataSchemaReflector");
var DataSchemaReflector = _DataSchemaReflector;

// node_modules/@e22m4u/ts-data-schema/dist/esm/decorators/data-schema-decorators.js
var import_js_format = require("@e22m4u/js-format");
var import_ts_reflector7 = require("@e22m4u/ts-reflector");
var import_ts_reflector8 = require("@e22m4u/ts-reflector");
var DECORATOR_PROPERTY_TARGET_ERROR_MESSAGE = "@%s decorator is only supported on an instance property.";
var REDUNDANT_TYPE_OPTION_ERROR_MESSAGE = 'The option "type" is not supported in the @%s decorator.';
function dsProperty(schema) {
  return function(target, propertyKey, descriptor) {
    const decoratorType = (0, import_ts_reflector8.getDecoratorTargetType)(target, propertyKey, descriptor);
    if (decoratorType !== import_ts_reflector7.DecoratorTargetType.INSTANCE_PROPERTY)
      throw new DecoratorTargetError(DECORATOR_PROPERTY_TARGET_ERROR_MESSAGE, "dsProperty");
    DataSchemaReflector.setMetadata(schema, target.constructor, propertyKey);
  };
}
__name(dsProperty, "dsProperty");
function checkDataSchemaDoesNotHaveSpecifiedTypeOption(decoratorName, schema) {
  if (schema && typeof schema === "object" && !Array.isArray(schema) && schema.type) {
    throw new import_js_format.Errorf(REDUNDANT_TYPE_OPTION_ERROR_MESSAGE, decoratorName);
  }
}
__name(checkDataSchemaDoesNotHaveSpecifiedTypeOption, "checkDataSchemaDoesNotHaveSpecifiedTypeOption");
function wrapDataSchemaPropertyDecoratorToReplaceErrorMessage(decoratorName, schema) {
  const dec = dsProperty(schema);
  return function(target, propertyKey, descriptor) {
    try {
      return dec(target, propertyKey, descriptor);
    } catch (error) {
      if (error instanceof DecoratorTargetError)
        throw new DecoratorTargetError(DECORATOR_PROPERTY_TARGET_ERROR_MESSAGE, decoratorName);
      throw error;
    }
  };
}
__name(wrapDataSchemaPropertyDecoratorToReplaceErrorMessage, "wrapDataSchemaPropertyDecoratorToReplaceErrorMessage");
function createDataSchemaPropertyDecoratorWithDataType(decoratorName, dataType) {
  return function(schema) {
    checkDataSchemaDoesNotHaveSpecifiedTypeOption(decoratorName, schema);
    return wrapDataSchemaPropertyDecoratorToReplaceErrorMessage(decoratorName, {
      ...schema,
      type: dataType
    });
  };
}
__name(createDataSchemaPropertyDecoratorWithDataType, "createDataSchemaPropertyDecoratorWithDataType");
var dsAny = createDataSchemaPropertyDecoratorWithDataType("dsAny", DataType.ANY);
var dsString = createDataSchemaPropertyDecoratorWithDataType("dsString", DataType.STRING);
var dsNumber = createDataSchemaPropertyDecoratorWithDataType("dsNumber", DataType.NUMBER);
var dsBoolean = createDataSchemaPropertyDecoratorWithDataType("dsBoolean", DataType.BOOLEAN);

// node_modules/@e22m4u/ts-data-schema/dist/esm/errors/validation-error.js
var import_js_format4 = require("@e22m4u/js-format");

// node_modules/@e22m4u/ts-data-schema/dist/esm/errors/decorator-target-error.js
var import_js_format5 = require("@e22m4u/js-format");
var _DecoratorTargetError = class _DecoratorTargetError extends import_js_format5.Errorf {
};
__name(_DecoratorTargetError, "DecoratorTargetError");
var DecoratorTargetError = _DecoratorTargetError;

// node_modules/@e22m4u/ts-data-schema/dist/esm/data-validator.js
var import_js_format7 = require("@e22m4u/js-format");
var import_js_format8 = require("@e22m4u/js-format");

// node_modules/@e22m4u/js-empty-values/src/empty-values-service.js
var import_js_format6 = require("@e22m4u/js-format");
var import_js_service = require("@e22m4u/js-service");

// node_modules/@e22m4u/ts-data-schema/dist/esm/debuggable-service.js
var import_js_service2 = require("@e22m4u/js-service");

// node_modules/@e22m4u/ts-data-schema/dist/esm/data-type-caster.js
var import_js_format9 = require("@e22m4u/js-format");

// dist/esm/utils/data-schema-to-oa-schema-object.js
function dataSchemaToOASchemaObject(dataSchema, defaultType) {
  const oaSchema = {};
  switch (dataSchema.type) {
    case DataType.STRING:
      oaSchema.type = import_ts_openapi.OADataType.STRING;
      break;
    case DataType.NUMBER:
      oaSchema.type = import_ts_openapi.OADataType.NUMBER;
      break;
    case DataType.BOOLEAN:
      oaSchema.type = import_ts_openapi.OADataType.BOOLEAN;
      break;
    case DataType.ARRAY:
      oaSchema.type = import_ts_openapi.OADataType.ARRAY;
      if (dataSchema.items) {
        const oaItemsSchema = dataSchemaToOASchemaObject(dataSchema.items, defaultType);
        if (Object.keys(oaItemsSchema).length)
          oaSchema.items = oaItemsSchema;
      }
      break;
    case DataType.OBJECT:
      oaSchema.type = import_ts_openapi.OADataType.OBJECT;
      if (dataSchema.properties) {
        oaSchema.properties = {};
        for (const key in dataSchema.properties) {
          const propSchema = dataSchema.properties[key];
          if (propSchema)
            oaSchema.properties[key] = dataSchemaToOASchemaObject(propSchema, defaultType);
        }
      }
      break;
    case DataType.ANY:
      break;
  }
  if (!oaSchema.type && defaultType) {
    oaSchema.type = defaultType;
  }
  if (dataSchema.default !== void 0) {
    let resolvedDefaultValue;
    if (typeof dataSchema.default === "function") {
      resolvedDefaultValue = dataSchema.default();
    } else {
      resolvedDefaultValue = dataSchema.default;
    }
    if (resolvedDefaultValue !== void 0)
      oaSchema.default = resolvedDefaultValue;
  }
  return oaSchema;
}
__name(dataSchemaToOASchemaObject, "dataSchemaToOASchemaObject");

// dist/esm/utils/convert-express-path-to-openapi.js
function convertExpressPathToOpenAPI(expressPath) {
  if (expressPath === null || expressPath === void 0) {
    return "";
  }
  if (expressPath === "/") {
    return "/";
  }
  const paramRegex = /:([a-zA-Z0-9_-]+)(?:\(([^)]+)\))?(\?)?/g;
  return expressPath.replace(paramRegex, (match, paramName) => `{${paramName}}`);
}
__name(convertExpressPathToOpenAPI, "convertExpressPathToOpenAPI");

// dist/esm/rest-router-openapi.js
var import_ts_openapi2 = require("@e22m4u/ts-openapi");
var import_ts_rest_router = require("@e22m4u/ts-rest-router");
var OPENAPI_VERSION = "3.1.0";
var REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP = /* @__PURE__ */ new Map([
  [import_ts_rest_router.RequestDataSource.PARAMS, import_ts_openapi2.OAParameterLocation.PATH],
  [import_ts_rest_router.RequestDataSource.QUERY, import_ts_openapi2.OAParameterLocation.QUERY],
  [import_ts_rest_router.RequestDataSource.HEADERS, import_ts_openapi2.OAParameterLocation.HEADER],
  [import_ts_rest_router.RequestDataSource.COOKIE, import_ts_openapi2.OAParameterLocation.COOKIE]
]);
var DATA_TYPE_TO_OA_MEDIA_TYPE = /* @__PURE__ */ new Map([
  [DataType.ANY, import_ts_openapi2.OAMediaType.TEXT_PLAIN],
  [DataType.STRING, import_ts_openapi2.OAMediaType.TEXT_PLAIN],
  [DataType.NUMBER, import_ts_openapi2.OAMediaType.APPLICATION_JSON],
  [DataType.BOOLEAN, import_ts_openapi2.OAMediaType.APPLICATION_JSON],
  [DataType.ARRAY, import_ts_openapi2.OAMediaType.APPLICATION_JSON],
  [DataType.OBJECT, import_ts_openapi2.OAMediaType.APPLICATION_JSON]
]);
var _RestRouterOpenAPI = class _RestRouterOpenAPI extends import_js_service3.Service {
  /**
   * Добавляет параметр в операцию.
   *
   * @param oaOperation
   * @param paramName
   * @param oaLocation
   * @param paramSchema
   * @protected
   */
  addParameterToOAOperation(oaOperation, paramName, oaLocation, paramSchema) {
    const existingOAParameter = oaOperation.parameters.find((oap) => {
      return oap.name === paramName && oap.in === oaLocation;
    });
    const oaParameter = existingOAParameter || {
      name: paramName,
      in: oaLocation,
      explode: false
    };
    if (paramSchema) {
      const oaMediaTypeObject = {};
      oaParameter.content = { [import_ts_openapi2.OAMediaType.APPLICATION_JSON]: oaMediaTypeObject };
      if (paramSchema.type === DataType.ANY) {
        oaMediaTypeObject.schema = dataSchemaToOASchemaObject({
          ...paramSchema,
          type: DataType.STRING
        });
      } else if (paramSchema.type != null) {
        oaMediaTypeObject.schema = dataSchemaToOASchemaObject(paramSchema);
      }
      if (paramSchema.required != null)
        oaParameter.required = Boolean(paramSchema.required);
    }
    if (oaLocation === import_ts_openapi2.OAParameterLocation.PATH)
      oaParameter.required = true;
    if (!existingOAParameter) {
      oaOperation.parameters = oaOperation.parameters || [];
      oaOperation.parameters.push(oaParameter);
    }
  }
  /**
   * Generate OpenAPI documentation.
   *
   * @param doc
   * @param options
   */
  genOpenAPIDocument(doc, options) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
    const router = this.getRegisteredService(import_ts_rest_router.RestRouter);
    doc = cloneDeep({ ...doc, openapi: OPENAPI_VERSION });
    const controllerMap = router.getService(import_ts_rest_router.ControllerRegistry).controllerMap;
    const controllers = Array.from(controllerMap.keys());
    const existingTagNames = new Set((_b = (_a = doc.tags) == null ? void 0 : _a.map((t) => t.name)) != null ? _b : []);
    for (const cls of controllers) {
      const controllerMd = import_ts_rest_router.RestControllerReflector.getMetadata(cls);
      if (!controllerMd)
        throw new import_js_format10.Errorf("Controller class %s does not have metadata.", cls.name);
      const tagName = !/^Controller$/i.test(cls.name) ? cls.name.replace(/Controller$/i, "") : cls.name;
      const actionsMd = import_ts_rest_router.RestActionReflector.getMetadata(cls);
      const tagPath = ((_c = controllerMd.path) != null ? _c : "").replace(/(^\/+|\/+$)/g, "").replace(/\/+/g, "/");
      const responseBodyMdMap = import_ts_rest_router.ResponseBodyReflector.getMetadata(cls);
      const requestBodiesMdMap = import_ts_openapi2.OARequestBodyReflector.getMetadata(cls);
      const controllerRootOptions = controllerMap.get(cls);
      const tagVisibilityMd = OAVisibilityReflector.getMetadata(cls);
      const isTagVisible = tagVisibilityMd == null ? void 0 : tagVisibilityMd.visible;
      let tagOperationsCounter = 0;
      for (const [actionName, actionMd] of actionsMd.entries()) {
        const opVisibilityMd = OAVisibilityReflector.getMetadata(cls, actionName);
        const isOperationVisible = opVisibilityMd == null ? void 0 : opVisibilityMd.visible;
        if (isOperationVisible === false)
          continue;
        if (isTagVisible === false && isOperationVisible !== true)
          continue;
        tagOperationsCounter++;
        const oaOperation = { tags: [tagName] };
        const rootPathPrefix = (_d = controllerRootOptions == null ? void 0 : controllerRootOptions.pathPrefix) != null ? _d : "";
        const operationPath = ((_e = actionMd.path) != null ? _e : "").replace(/(^\/+|\/+$)/g, "").replace(/\/+/g, "/");
        let fullOperationPath = `/${rootPathPrefix}/${tagPath}/${operationPath}`.replace(/\/+$/, "").replace(/\/+/g, "/") || "/";
        if (options == null ? void 0 : options.stripPathPrefix) {
          let pathPrefixStripList = [options == null ? void 0 : options.stripPathPrefix].flat();
          pathPrefixStripList.sort((a, b) => b.length - a.length);
          pathPrefixStripList = pathPrefixStripList.map((prefix) => "/" + String(prefix).replace(/(^\/+|\/+$)/g, "").replace(/\/+/g, "/"));
          for (const prefix of pathPrefixStripList) {
            if (fullOperationPath.indexOf(prefix) === 0) {
              const prefixLength = prefix.length;
              const pathLength = fullOperationPath.length;
              const isExactMatch = pathLength === prefixLength;
              const isSegmentMatch = pathLength > prefixLength && fullOperationPath[prefixLength] === "/";
              if (isExactMatch || isSegmentMatch) {
                fullOperationPath = fullOperationPath.slice(prefixLength);
                if (fullOperationPath === "") {
                  fullOperationPath = "/";
                }
                break;
              }
            }
          }
        }
        const oaOperationPath = convertExpressPathToOpenAPI(fullOperationPath);
        doc.paths = (_f = doc.paths) != null ? _f : {};
        doc.paths[oaOperationPath] = (_g = doc.paths[oaOperationPath]) != null ? _g : {};
        const oaPathItem = doc.paths[oaOperationPath];
        const oaOperationMethod = actionMd.method.toLowerCase();
        oaPathItem[oaOperationMethod] = oaOperation;
        const requestDataMdMap = import_ts_rest_router.RequestDataReflector.getMetadata(cls, actionName);
        const requestDataMds = Array.from(requestDataMdMap.values()).reverse();
        for (const requestDataMd of requestDataMds) {
          oaOperation.parameters = (_h = oaOperation.parameters) != null ? _h : [];
          let requestDataSchema;
          if (typeof requestDataMd.schema === "function") {
            requestDataSchema = requestDataMd.schema(this.container);
          } else {
            requestDataSchema = requestDataMd.schema;
          }
          if (REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(requestDataMd.source) && requestDataSchema && requestDataSchema.type === DataType.OBJECT && requestDataSchema.properties && typeof requestDataSchema.properties === "object" && Object.keys(requestDataSchema.properties).length && requestDataMd.property) {
            const oaLocation = REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(requestDataMd.source);
            const paramSchema = requestDataSchema && typeof requestDataSchema === "object" && requestDataSchema.properties && typeof requestDataSchema.properties === "object" && requestDataSchema.properties[requestDataMd.property] && typeof requestDataSchema.properties[requestDataMd.property] === "object" && requestDataSchema.properties[requestDataMd.property] || void 0;
            this.addParameterToOAOperation(oaOperation, requestDataMd.property, oaLocation, paramSchema);
          } else if (REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(requestDataMd.source) && requestDataSchema && requestDataSchema.type === DataType.OBJECT && requestDataSchema.properties && typeof requestDataSchema.properties === "object" && Object.keys(requestDataSchema.properties).length) {
            const oaLocation = REQUEST_DATA_SOURCE_TO_OPENAPI_LOCATION_MAP.get(requestDataMd.source);
            const propsSchemaEntries = Object.entries(requestDataSchema.properties);
            for (const [paramName, paramSchema] of propsSchemaEntries) {
              this.addParameterToOAOperation(oaOperation, paramName, oaLocation, paramSchema);
            }
          } else if (requestDataMd.source === import_ts_rest_router.RequestDataSource.BODY) {
            const dataType = (requestDataSchema == null ? void 0 : requestDataSchema.type) || DataType.ANY;
            const oaMediaType = DATA_TYPE_TO_OA_MEDIA_TYPE.get(dataType);
            if (!oaMediaType)
              throw new import_js_format10.Errorf("MIME of %v is not defined.", dataType);
            oaOperation.requestBody = oaOperation.requestBody || { content: {} };
            const oaBodyObject = oaOperation.requestBody;
            const oaBodyContent = oaBodyObject.content || {};
            oaBodyContent[oaMediaType] = oaBodyContent[oaMediaType] || {};
            const oaMediaObject = oaBodyContent[oaMediaType];
            const defaultOASchema = { type: import_ts_openapi2.OADataType.STRING };
            oaMediaObject.schema = oaMediaObject.schema || defaultOASchema;
            const existingOASchema = oaMediaObject.schema;
            const oaSchema = dataSchemaToOASchemaObject({ ...requestDataSchema, type: dataType }, import_ts_openapi2.OADataType.STRING);
            if (dataType === DataType.OBJECT) {
              if (existingOASchema.type === import_ts_openapi2.OADataType.OBJECT) {
                deepAssign(existingOASchema, oaSchema);
              } else {
                oaMediaObject.schema = oaSchema;
              }
              if (oaMediaObject.schema && oaMediaObject.schema.properties) {
                const oaSchemaProps = oaMediaObject.schema.properties;
                for (const [propName, propValue] of Object.entries(oaSchemaProps)) {
                  if (!propValue || !Object.keys(propValue).length)
                    delete oaSchemaProps[propName];
                }
                if (!Object.keys(oaSchemaProps).length)
                  delete oaMediaObject.schema.properties;
              }
            } else if (dataType !== DataType.ANY) {
              if (oaSchema) {
                oaMediaObject.schema = oaSchema;
              }
            }
            if ((requestDataSchema == null ? void 0 : requestDataSchema.required) != null)
              oaBodyObject.required = Boolean(requestDataSchema.required);
          }
          if (!oaOperation.parameters.length)
            delete oaOperation.parameters;
        }
        const responseBodyMd = responseBodyMdMap.get(actionName);
        if (responseBodyMd && responseBodyMd.schema) {
          let responseBodySchema;
          if (typeof responseBodyMd.schema === "function") {
            responseBodySchema = responseBodyMd.schema(this.container);
          } else {
            responseBodySchema = responseBodyMd.schema;
          }
          if (responseBodySchema) {
            const dataType = responseBodySchema.type || DataType.ANY;
            const oaMediaType = DATA_TYPE_TO_OA_MEDIA_TYPE.get(dataType);
            if (!oaMediaType)
              throw new import_js_format10.Errorf("MIME of %v is not defined.", dataType);
            oaOperation.responses = (_i = oaOperation.responses) != null ? _i : {};
            const oaResponses = oaOperation.responses;
            oaResponses.default = oaResponses.default || {
              description: "Example",
              content: {}
            };
            const oaResponse = oaResponses.default;
            const oaMediaObject = oaResponse.content || {};
            const oaSchema = dataSchemaToOASchemaObject(responseBodySchema, import_ts_openapi2.OADataType.STRING);
            oaMediaObject[oaMediaType] = { schema: oaSchema };
          }
        }
        const requestBodiesMd = requestBodiesMdMap.get(actionName);
        if (requestBodiesMd) {
          requestBodiesMd.reverse().forEach((requestBodyMd) => {
            var _a2;
            oaOperation.requestBody = (_a2 = oaOperation.requestBody) != null ? _a2 : {
              description: requestBodyMd.description,
              content: {},
              required: requestBodyMd.required
            };
            const oaRequestBody = oaOperation.requestBody;
            oaRequestBody.content[requestBodyMd.mediaType] = {
              schema: requestBodyMd.schema,
              example: requestBodyMd.example
            };
          });
        }
        const responsesMdMap = import_ts_openapi2.OAResponseReflector.getMetadata(cls);
        const responsesMd = responsesMdMap.get(actionName);
        if (responsesMd) {
          oaOperation.responses = (_j = oaOperation.responses) != null ? _j : {};
          const oaResponses = oaOperation.responses;
          responsesMd.reverse().forEach((responseMd) => {
            var _a2, _b2;
            const statusCode = responseMd.statusCode ? String(responseMd.statusCode) : "default";
            oaResponses[statusCode] = (_a2 = oaResponses[statusCode]) != null ? _a2 : {
              description: responseMd.description
            };
            const oaResponse = oaResponses[statusCode];
            oaResponse.content = (_b2 = oaResponse.content) != null ? _b2 : {};
            const oaContent = oaResponse.content;
            oaContent[responseMd.mediaType] = {
              schema: responseMd.schema,
              example: responseMd.example
            };
          });
        }
      }
      if (tagOperationsCounter) {
        if (!existingTagNames.has(tagName)) {
          doc.tags = (_k = doc.tags) != null ? _k : [];
          doc.tags.push({ name: tagName });
          existingTagNames.add(tagName);
        }
      }
    }
    return doc;
  }
};
__name(_RestRouterOpenAPI, "RestRouterOpenAPI");
var RestRouterOpenAPI = _RestRouterOpenAPI;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OAVisibilityReflector,
  OA_VISIBILITY_METADATA_KEY,
  OPENAPI_VERSION,
  RestRouterOpenAPI,
  dataSchemaToOASchemaObject,
  oaHidden,
  oaVisibility,
  oaVisible
});
