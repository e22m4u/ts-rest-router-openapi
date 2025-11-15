import { OADataType } from '@e22m4u/ts-openapi';
import { DataSchema } from '@e22m4u/ts-data-schema';
import { OASchemaObject } from '@e22m4u/ts-openapi';
/**
 * Data schema with open api options.
 */
export type DataSchemaWithOaOptions = DataSchema & {
    items?: DataSchemaWithOaOptions;
    properties?: {
        [key: string]: DataSchemaWithOaOptions | undefined;
    };
    oaDefault?: DataSchema['default'];
};
/**
 * Конвертация DataSchema в OASchemaObject.
 *
 * @param dataSchema
 * @param defaultType
 */
export declare function dataSchemaToOASchemaObject(dataSchema: DataSchemaWithOaOptions, defaultType?: OADataType): OASchemaObject;
