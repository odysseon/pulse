import { Injectable, BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';
import { MediaStorageService } from '../../../../storage/media-storage.service.js';
import { IMediaRepository } from '../../domain/ports/media.repository.port.js';
import { MediaResourceType } from '../../domain/types/media-resource-type.enum.js';
import {
  MediaRole,
  SINGLETON_ROLES,
  ROLES_BY_RESOURCE_TYPE,
} from '../../domain/types/media-role.enum.js';
import { MediaType } from '../../domain/types/media-type.enum.js';
import { Media } from '../../domain/types/media.entity.js';

export interface AddMediaInput {
  readonly resourceType: MediaResourceType;
  readonly resourceId: string;
  readonly requesterId: string;
  readonly fileName: string;
  readonly fileStream: Readable;
  readonly mediaType: MediaType;
  readonly role: MediaRole;
}

/** Max gallery items per resource (excludes singleton slots LOGO/BANNER/COVER) */
const MAX_GALLERY_ITEMS = 18;

const STORAGE_DESTINATION: Record<MediaResourceType, string> = {
  [MediaResourceType.LISTING]: 'listings/media',
  [MediaResourceType.BUSINESS_PROFILE]: 'businesses/media',
};

@Injectable()
export class AddMediaUseCase {
  constructor(
    private readonly mediaRepo: IMediaRepository,
    private readonly storage: MediaStorageService,
  ) {}

  async execute(input: AddMediaInput): Promise<Media> {
    // 1. Validate role is legal for this resource type
    const allowedRoles = ROLES_BY_RESOURCE_TYPE[input.resourceType];
    if (!allowedRoles?.has(input.role)) {
      throw new BadRequestException(
        `Role "${input.role}" is not valid for resource type "${input.resourceType}".`,
      );
    }

    const isSingleton = SINGLETON_ROLES.has(input.role);

    // 2a. For singleton roles: find the existing one to replace (if any)
    //     We capture it before uploading so we can clean up after.
    let replacedFileId: string | null = null;
    let replacedId: string | null = null;

    if (isSingleton) {
      const existing = await this.mediaRepo.findByRole(
        input.resourceType,
        input.resourceId,
        input.role,
      );
      if (existing.length > 0) {
        replacedId = existing[0].id;
        replacedFileId = existing[0].fileId;
      }
    } else {
      // 2b. For GALLERY: enforce per-resource cap
      const galleryCount = await this.mediaRepo.countByRole(
        input.resourceType,
        input.resourceId,
        MediaRole.GALLERY,
      );
      if (galleryCount >= MAX_GALLERY_ITEMS) {
        throw new BadRequestException(
          `Maximum of ${MAX_GALLERY_ITEMS} gallery items allowed per resource.`,
        );
      }
    }

    // 3. Upload new file to storage first
    //    If this fails nothing has been mutated — safe to propagate the error.
    const result = await this.storage.uploadNewMedia({
      destination: STORAGE_DESTINATION[input.resourceType],
      fileName: input.fileName,
      fileData: input.fileStream,
    });

    // 4. If replacing a singleton: remove the old DB record before inserting the new one.
    //    This keeps the singleton invariant intact at the persistence layer.
    if (replacedId) {
      await this.mediaRepo.delete(replacedId);
    }

    // 5. Persist the new media record.
    //    Singletons carry no position (order = null); GALLERY appended at end.
    const order = isSingleton
      ? null
      : await this.mediaRepo.countByRole(input.resourceType, input.resourceId, MediaRole.GALLERY);

    const created = await this.mediaRepo.add({
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      url: result.url,
      fileId: result.fileId,
      mediaType: input.mediaType,
      role: input.role,
      order,
    });

    // 6. Delete the old storage asset after DB is consistent.
    //    Non-fatal — a dangling storage file is preferable to rolling back a successful replace.
    if (replacedFileId) {
      await this.storage.deleteMedia(replacedFileId).catch(() => {
        // TODO: log orphaned storage asset for async cleanup
      });
    }

    return created;
  }
}
