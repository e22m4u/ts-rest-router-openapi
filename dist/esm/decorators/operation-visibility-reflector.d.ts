import { Constructor } from '../types.js';
import { OAOperationVisibilityMetadata } from './operation-visibility-metadata.js';
import { OAOperationVisibilityMetadataMap } from './operation-visibility-metadata.js';
/**
 * Operation visibility reflector.
 */
export declare class OAOperationVisibilityReflector {
    /**
     * Set metadata.
     *
     * @param metadata
     * @param target
     * @param propertyKey
     */
    static setMetadata(metadata: OAOperationVisibilityMetadata, target: Constructor, propertyKey: string): void;
    /**
     * Get metadata.
     *
     * @param target
     */
    static getMetadata(target: Constructor): OAOperationVisibilityMetadataMap;
}
