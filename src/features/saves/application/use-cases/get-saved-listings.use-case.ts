import { Injectable } from '@nestjs/common';
import { ISavesRepository, SavedListingView } from '../../domain/ports/saves.repository.port.js';

@Injectable()
export class GetSavedListingsUseCase {
  constructor(private readonly savesRepository: ISavesRepository) {}

  async execute(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ items: SavedListingView[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const { items, total } = await this.savesRepository.getSavedListings(userId, skip, limit);
    return { items, total, page, limit };
  }
}
