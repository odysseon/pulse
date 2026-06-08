import { Injectable, NotFoundException } from '@nestjs/common';
import { IStoreTourRepository } from '../../domain/ports/store-tour.repository.port.js';
import { StoreTour } from '../../domain/types/store-tour.entity.js';
import { UpdateStoreTourInput } from '../../domain/types/store-tour.types.js';

@Injectable()
export class UpdateStoreTourUseCase {
  constructor(private readonly storeTourRepo: IStoreTourRepository) {}

  async execute(id: string, input: UpdateStoreTourInput): Promise<StoreTour> {
    const existing = await this.storeTourRepo.findById(id);
    if (!existing) {
      throw new NotFoundException('Store tour not found.');
    }

    return this.storeTourRepo.update(id, input);
  }
}
