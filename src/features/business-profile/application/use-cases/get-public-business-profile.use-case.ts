import { Injectable, NotFoundException } from '@nestjs/common';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { BusinessProfile } from '../../domain/types/business-profile.entity.js';

@Injectable()
export class GetPublicBusinessProfileUseCase {
  constructor(private readonly repo: IBusinessProfileRepository) {}

  async execute(slug: string): Promise<BusinessProfile> {
    const profile = await this.repo.findBySlug(slug);

    if (!profile || !profile.isPublic) {
      throw new NotFoundException('Business profile not found.');
    }

    return profile;
  }
}
