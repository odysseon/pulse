import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { MediaStorageService } from '../../../../storage/media-storage.service.js';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { BusinessProfile } from '../../domain/types/business-profile.entity.js';

export interface UploadLogoInput {
  readonly businessId: string;
  readonly requesterId: string;
  readonly fileName: string;
  readonly fileStream: Readable;
}

@Injectable()
export class UploadBusinessLogoUseCase {
  constructor(
    private readonly repo: IBusinessProfileRepository,
    private readonly storage: MediaStorageService,
  ) {}

  async execute(input: UploadLogoInput): Promise<BusinessProfile> {
    const profile = await this.repo.findById(input.businessId);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    if (profile.ownerId !== input.requesterId) {
      throw new ForbiddenException('You do not own this business profile.');
    }

    const result = await this.storage.uploadNewMedia({
      destination: 'businesses/logos',
      fileName: input.fileName,
      fileData: input.fileStream,
    });

    const updated = await this.repo.updateBranding(input.businessId, {
      logoUrl: result.url,
      logoId: result.fileId,
    });

    // Clean up old asset only after successful DB update
    if (profile.logoId) {
      await this.storage.deleteMedia(profile.logoId);
    }

    return updated;
  }
}
