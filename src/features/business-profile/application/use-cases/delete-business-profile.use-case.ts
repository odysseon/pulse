import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import type { IBusinessProfileRepository } from '../../domain/ports/business-profile.repository.port.js';

@Injectable()
export class DeleteBusinessProfileUseCase {
  constructor(private readonly repo: IBusinessProfileRepository) {}

  async execute(id: string, requesterId: string): Promise<void> {
    const profile = await this.repo.findById(id);

    if (!profile) {
      throw new NotFoundException('Business profile not found.');
    }

    if (profile.ownerId !== requesterId) {
      throw new ForbiddenException('You do not own this business profile.');
    }

    await this.repo.delete(id);
  }
}
