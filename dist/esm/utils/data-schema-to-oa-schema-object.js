import { OADataType } from '@e22m4u/ts-openapi';
import { DataType } from '@e22m4u/ts-data-schema';
/**
 * Конвертация DataSchema в OASchemaObject.
 *
 * @param dataSchema
 * @param defaultType
 */
export function dataSchemaToOASchemaObject(dataSchema, defaultType) {
    const oaSchema = {};
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
                const oaItemsSchema = dataSchemaToOASchemaObject(dataSchema.items, defaultType);
                if (Object.keys(oaItemsSchema).length)
                    oaSchema.items = oaItemsSchema;
            }
            break;
        case DataType.OBJECT:
            oaSchema.type = OADataType.OBJECT;
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
    if (dataSchema.default !== undefined) {
        let resolvedDefaultValue;
        if (typeof dataSchema.default === 'function') {
            resolvedDefaultValue = dataSchema.default();
        }
        else {
            resolvedDefaultValue = dataSchema.default;
        }
        if (resolvedDefaultValue !== undefined)
            oaSchema.default = resolvedDefaultValue;
    }
    return oaSchema;
}
