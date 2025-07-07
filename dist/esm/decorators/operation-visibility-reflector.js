import { Reflector } from '@e22m4u/ts-reflector';
import { OA_OPERATION_VISIBILITY_METADATA_KEY } from './operation-visibility-metadata.js';
/**
 * Operation visibility reflector.
 */
export class OAOperationVisibilityReflector {
    /**
     * Set metadata.
     *
     * @param metadata
     * @param target
     * @param propertyKey
     */
    static setMetadata(metadata, target, propertyKey) {
        const oldMap = Reflector.getOwnMetadata(OA_OPERATION_VISIBILITY_METADATA_KEY, target);
        const newMap = new Map(oldMap);
        newMap.set(propertyKey, metadata);
        Reflector.defineMetadata(OA_OPERATION_VISIBILITY_METADATA_KEY, newMap, target);
    }
    /**
     * Get metadata.
     *
     * @param target
     */
    static getMetadata(target) {
        const metadata = Reflector.getOwnMetadata(OA_OPERATION_VISIBILITY_METADATA_KEY, target);
        return metadata ?? new Map();
    }
}
