import { Injectable, NotFoundException } from '@nestjs/common';
import { MediaStorageService } from '../../../../storage/media-storage.service.js';
import { IMediaRepository } from '../../domain/ports/media.repository.port.js';
import { MediaRole } from '../../domain/types/media-role.enum.js';

@Injectable()
export class DeleteMediaUseCase {
  constructor(
    private readonly mediaRepo: IMediaRepository,
    private readonly storage: MediaStorageService,
  ) {}

  async execute(id: string): Promise<void> {
    const media = await this.mediaRepo.findById(id);

    if (!media) {
      throw new NotFoundException('Media item not found.');
    }

    // Delete from DB first — if storage cleanup fails it's logged, not fatal
    await this.mediaRepo.delete(id);

    // Only renormalize order for GALLERY items — singletons have no position to renormalize
    if (media.role === MediaRole.GALLERY) {
      await this.mediaRepo.renormalize(media.resourceType, media.resourceId);
    }

    // Clean up storage asset after DB is consistent
    await this.storage.deleteMedia(media.fileId);
  }
}
