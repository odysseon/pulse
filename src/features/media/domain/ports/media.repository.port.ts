import { Media } from '../types/media.entity.js';
import { AddMediaInput, ReorderMediaInput } from '../types/media.types.js';
import { MediaResourceType } from '../types/media-resource-type.enum.js';
import { MediaRole } from '../types/media-role.enum.js';

export abstract class IMediaRepository {
  abstract add(input: AddMediaInput): Promise<Media>;

  /**
   * Return all media for a resource, ordered by role then order ASC.
   */
  abstract findByResource(resourceType: MediaResourceType, resourceId: string): Promise<Media[]>;

  abstract findById(id: string): Promise<Media | null>;

  /**
   * Return all media for a resource matching a specific role.
   * For singleton roles (LOGO, BANNER, COVER) this returns 0 or 1 items.
   * For GALLERY this returns all gallery items ordered by order ASC.
   */
  abstract findByRole(
    resourceType: MediaResourceType,
    resourceId: string,
    role: MediaRole,
  ): Promise<Media[]>;

  /**
   * Reorder GALLERY items for a resource.
   * Receives the full desired sequence as an ordered array of IDs.
   * Persists contiguous 0-based order values matching the array position.
   */
  abstract reorder(
    resourceType: MediaResourceType,
    resourceId: string,
    input: ReorderMediaInput,
  ): Promise<Media[]>;

  /**
   * Delete a single media item.
   * Caller is responsible for renormalizing GALLERY order after deletion.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Renormalize order values for GALLERY items in a resource to be contiguous from 0.
   * Called after a GALLERY item is deleted to close gaps.
   */
  abstract renormalize(resourceType: MediaResourceType, resourceId: string): Promise<void>;

  /**
   * Count total media items for a resource.
   * Used to enforce the overall per-resource media cap at the application layer.
   */
  abstract countByResource(resourceType: MediaResourceType, resourceId: string): Promise<number>;

  /**
   * Count media items for a specific role within a resource.
   * Used to enforce singleton and per-role cardinality at the application layer.
   */
  abstract countByRole(
    resourceType: MediaResourceType,
    resourceId: string,
    role: MediaRole,
  ): Promise<number>;
}
