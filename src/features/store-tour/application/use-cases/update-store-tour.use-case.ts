import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { IStoreTourRepository } from '../../domain/ports/store-tour.repository.port.js';
import { StoreTour, StoreTourStatus } from '../../domain/types/store-tour.entity.js';
import { UpdateStoreTourInput } from '../../domain/types/store-tour.types.js';

@Injectable()
export class UpdateStoreTourUseCase {
  constructor(private readonly storeTourRepo: IStoreTourRepository) {}

  async execute(id: string, input: UpdateStoreTourInput): Promise<StoreTour> {
    const existing = await this.storeTourRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Store tour not found.');
    }

    if (input.status === StoreTourStatus.PUBLISHED) {
      if (!existing.media || existing.media.length === 0) {
        throw new BadRequestException('Cannot publish a store tour without at least one media item.');
      }
    }

    return this.storeTourRepo.update(id, input);
  }
}
