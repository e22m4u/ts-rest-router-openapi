import { Reflector } from '@e22m4u/ts-reflector';
import { OA_VISIBILITY_METADATA_KEY } from './visibility-metadata.js';
/**
 * Visibility reflector.
 */
export class OAVisibilityReflector {
    /**
     * Set metadata.
     *
     * @param metadata
     * @param target
     * @param propertyKey
     */
    static setMetadata(metadata, target, propertyKey) {
        if (propertyKey) {
            Reflector.defineMetadata(OA_VISIBILITY_METADATA_KEY, metadata, target, propertyKey);
        }
        else {
            Reflector.defineMetadata(OA_VISIBILITY_METADATA_KEY, metadata, target);
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
            return Reflector.getOwnMetadata(OA_VISIBILITY_METADATA_KEY, target, propertyKey);
        }
        return Reflector.getOwnMetadata(OA_VISIBILITY_METADATA_KEY, target);
    }
}
