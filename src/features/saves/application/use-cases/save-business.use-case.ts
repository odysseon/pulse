import { Injectable } from '@nestjs/common';
import { ISavesRepository } from '../../domain/ports/saves.repository.port.js';

@Injectable()
export class SaveBusinessUseCase {
  constructor(private readonly savesRepository: ISavesRepository) {}

  async execute(userId: string, businessProfileId: string): Promise<void> {
    await this.savesRepository.saveBusiness(userId, businessProfileId);
  }
}
