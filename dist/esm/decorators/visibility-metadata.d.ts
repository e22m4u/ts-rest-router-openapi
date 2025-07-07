import { MetadataKey } from '@e22m4u/ts-reflector';
/**
 * Visibility metadata.
 */
export type OAVisibilityMetadata = {
    method?: string;
    visible: boolean;
};
/**
 * Visibility metadata key.
 */
export declare const OA_VISIBILITY_METADATA_KEY: MetadataKey<OAVisibilityMetadata>;
