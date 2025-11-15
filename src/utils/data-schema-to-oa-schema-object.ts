import {OADataType} from '@e22m4u/ts-openapi';
import {DataType} from '@e22m4u/ts-data-schema';
import {DataSchema} from '@e22m4u/ts-data-schema';
import {OASchemaObject} from '@e22m4u/ts-openapi';

/**
 * Data schema with open api options.
 */
export type DataSchemaWithOaOptions = DataSchema & {
  items?: DataSchemaWithOaOptions;
  properties?: {[key: string]: DataSchemaWithOaOptions | undefined};
  oaDefault?: DataSchema['default'];
};

/**
 * Конвертация DataSchema в OASchemaObject.
 *
 * @param dataSchema
 * @param defaultType
 */
export function dataSchemaToOASchemaObject(
  dataSchema: DataSchemaWithOaOptions,
  defaultType?: OADataType,
) {
  const oaSchema: OASchemaObject = {};
  // преобразование типа
  switch (dataSchema.type) {
    case DataType.STRING:
      oaSchema.type = OADataType.STRING;
      break;
    case DataType.NUMBER:
      oaSchema.type = OADataType.NUMBER;
      break;
    case DataType.BOOLEAN:
      oaSchema.type = OADataType.BOOLEAN;
      break;
    case DataType.ARRAY:
      oaSchema.type = OADataType.ARRAY;
      if (dataSchema.items) {
        const oaItemsSchema = dataSchemaToOASchemaObject(
          dataSchema.items,
          defaultType,
        );
        if (Object.keys(oaItemsSchema).length) oaSchema.items = oaItemsSchema;
      }
      break;
    case DataType.OBJECT:
      oaSchema.type = OADataType.OBJECT;
      if (dataSchema.properties) {
        oaSchema.properties = {};
        for (const key in dataSchema.properties) {
          const propSchema = dataSchema.properties[key];
          if (propSchema)
            oaSchema.properties[key] = dataSchemaToOASchemaObject(
              propSchema,
              defaultType,
            );
        }
      }
      break;
    case DataType.ANY:
      // для DataType.ANY поле `type` опускается
      break;
  }
  // если тип не определен, то устанавливается
  // тип по умолчанию (если указан)
  if (!oaSchema.type && defaultType) {
    oaSchema.type = defaultType;
  }
  // преобразование значения по умолчанию,
  // с учетом возможной фабрики
  const dsDefault =
    dataSchema.oaDefault === undefined
      ? dataSchema.default
      : dataSchema.oaDefault;
  if (dsDefault !== undefined) {
    let resolvedDefaultValue: unknown;
    if (typeof dsDefault === 'function') {
      resolvedDefaultValue = (dsDefault as () => unknown)();
    } else {
      resolvedDefaultValue = dsDefault;
    }
    if (resolvedDefaultValue !== undefined)
      oaSchema.default = resolvedDefaultValue;
  }
  return oaSchema;
}
