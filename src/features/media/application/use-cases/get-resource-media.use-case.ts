import { Injectable } from '@nestjs/common';
import { IMediaRepository } from '../../domain/ports/media.repository.port.js';
import { MediaResourceType } from '../../domain/types/media-resource-type.enum.js';
import { Media } from '../../domain/types/media.entity.js';

@Injectable()
export class GetResourceMediaUseCase {
  constructor(private readonly mediaRepo: IMediaRepository) {}

  async execute(resourceType: MediaResourceType, resourceId: string): Promise<Media[]> {
    return this.mediaRepo.findByResource(resourceType, resourceId);
  }
}
