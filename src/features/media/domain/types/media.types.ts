import { MediaResourceType } from './media-resource-type.enum.js';
import { MediaRole } from './media-role.enum.js';
import { MediaType } from './media-type.enum.js';

export interface AddMediaInput {
  readonly resourceType: MediaResourceType;
  readonly resourceId: string;
  readonly url: string;
  readonly fileId: string;
  readonly mediaType: MediaType;
  readonly role: MediaRole;
  /** Assigned by use case after normalization — not provided by caller */
  readonly order: number | null;
}

export interface ReorderMediaInput {
  /** Ordered array of media IDs representing the desired sequence */
  readonly orderedIds: string[];
}

export interface MediaView {
  readonly id: string;
  readonly resourceType: MediaResourceType;
  readonly resourceId: string;
  readonly url: string;
  readonly mediaType: MediaType;
  readonly role: MediaRole;
  readonly order: number | null;
  readonly createdAt: Date;
}
