import { Constructor } from '../types.js';
import { OAVisibilityMetadata } from './visibility-metadata.js';
/**
 * Visibility reflector.
 */
export declare class OAVisibilityReflector {
    /**
     * Set metadata.
     *
     * @param metadata
     * @param target
     * @param propertyKey
     */
    static setMetadata(metadata: OAVisibilityMetadata, target: Constructor, propertyKey?: string): void;
    /**
     * Get metadata.
     *
     * @param target
     * @param propertyKey
     */
    static getMetadata(target: Constructor, propertyKey?: string): OAVisibilityMetadata | undefined;
}
