import { Injectable } from '@nestjs/common';
import { ISavesRepository } from '../../domain/ports/saves.repository.port.js';

@Injectable()
export class UnsaveListingUseCase {
  constructor(private readonly savesRepository: ISavesRepository) {}

  async execute(userId: string, listingId: string): Promise<void> {
    await this.savesRepository.unsaveListing(userId, listingId);
  }
}
