import {MetadataKey} from '@e22m4u/ts-reflector';

/**
 * Operation visibility metadata.
 */
export type OAOperationVisibilityMetadata = {
  method: string;
  visible: boolean;
};

/**
 * Operation visibility metadata map.
 */
export type OAOperationVisibilityMetadataMap = Map<
  string,
  OAOperationVisibilityMetadata
>;

/**
 * Operations visibility metadata key.
 */
export const OA_OPERATION_VISIBILITY_METADATA_KEY =
  new MetadataKey<OAOperationVisibilityMetadataMap>(
    'openApiOperationVisibilityMetadataKey',
  );
