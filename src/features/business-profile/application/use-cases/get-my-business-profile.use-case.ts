import { Injectable } from '@nestjs/common';
import { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';
import { BusinessProfileView } from '../../domain/types/business-profile.types.js';

@Injectable()
export class GetMyBusinessProfileUseCase {
  constructor(private readonly repo: IBusinessProfileRepository) {}

  async execute(ownerId: string): Promise<BusinessProfileView | null> {
    return this.repo.findByOwner(ownerId);
  }
}
