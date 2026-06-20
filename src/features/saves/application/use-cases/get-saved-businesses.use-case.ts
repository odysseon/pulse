import { Injectable } from '@nestjs/common';
import { ISavesRepository, SavedBusinessView } from '../../domain/ports/saves.repository.port.js';

@Injectable()
export class GetSavedBusinessesUseCase {
  constructor(private readonly savesRepository: ISavesRepository) {}

  async execute(userId: string, page: number, limit: number): Promise<{ items: SavedBusinessView[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    const { items, total } = await this.savesRepository.getSavedBusinesses(userId, skip, limit);
    return { items, total, page, limit };
  }
}
