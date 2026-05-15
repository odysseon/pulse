import { Injectable } from '@nestjs/common';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { BusinessProfile } from '../../domain/types/business-profile.entity.js';

@Injectable()
export class GetMyBusinessProfilesUseCase {
  constructor(private readonly repo: IBusinessProfileRepository) {}

  async execute(ownerId: string): Promise<BusinessProfile[]> {
    return this.repo.findByOwner(ownerId);
  }
}
