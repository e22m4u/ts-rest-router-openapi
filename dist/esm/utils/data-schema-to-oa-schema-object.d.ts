import { OADataType } from '@e22m4u/ts-openapi';
import { DataSchema } from '@e22m4u/ts-data-schema';
import { OASchemaObject } from '@e22m4u/ts-openapi';
/**
 * Конвертация DataSchema в OASchemaObject.
 *
 * @param dataSchema
 * @param defaultType
 */
export declare function dataSchemaToOASchemaObject(dataSchema: DataSchema, defaultType?: OADataType): OASchemaObject;
