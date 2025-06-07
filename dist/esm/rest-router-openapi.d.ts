import { Flatten } from './types.js';
import { Service } from '@e22m4u/js-service';
import { OADocumentObject, OAOperationObject, OAParameterLocation } from '@e22m4u/ts-openapi';
import { DataSchema } from '@e22m4u/ts-data-schema';
/**
 * OpenAPI version.
 */
export declare const OPENAPI_VERSION = "3.1.0";
/**
 * OpenAPI to RestRouter integration service.
 */
export declare class RestRouterOpenAPI extends Service {
    /**
     * Добавляет параметр в операцию.
     *
     * @param oaOperation
     * @param paramName
     * @param oaLocation
     * @param paramSchema
     * @protected
     */
    protected addParameterToOAOperation(oaOperation: OAOperationObject, paramName: string, oaLocation: OAParameterLocation, paramSchema: DataSchema | undefined): void;
    /**
     * Generate OpenAPI documentation.
     *
     * @param doc
     */
    genOpenAPIDocument(doc: Flatten<Omit<OADocumentObject, 'openapi'>>): {
        info: import("@e22m4u/ts-openapi").OAInfoObject;
        jsonSchemaDialect?: string | undefined;
        servers?: import("@e22m4u/ts-openapi").OAServerObject[] | undefined;
        paths?: import("@e22m4u/ts-openapi").OAPathsObject | undefined;
        components?: import("@e22m4u/ts-openapi").OAComponentsObject | undefined;
        security?: import("@e22m4u/ts-openapi").OASecurityRequirementObject[] | undefined;
        tags?: import("@e22m4u/ts-openapi").OATagObject[] | undefined;
        externalDocs?: import("@e22m4u/ts-openapi").OAExternalDocumentationObject | undefined;
    };
}
