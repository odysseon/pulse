import { Module } from '@nestjs/common';
import { SavesController } from './api/controllers/saves.controller.js';
import { ISavesRepository } from './domain/ports/saves.repository.port.js';
import { PrismaSavesRepository } from './infrastructure/prisma-saves.repository.js';
import { SaveBusinessUseCase } from './application/use-cases/save-business.use-case.js';
import { UnsaveBusinessUseCase } from './application/use-cases/unsave-business.use-case.js';
import { SaveListingUseCase } from './application/use-cases/save-listing.use-case.js';
import { UnsaveListingUseCase } from './application/use-cases/unsave-listing.use-case.js';
import { GetSavedBusinessesUseCase } from './application/use-cases/get-saved-businesses.use-case.js';
import { GetSavedListingsUseCase } from './application/use-cases/get-saved-listings.use-case.js';

@Module({
  controllers: [SavesController],
  providers: [
    {
      provide: ISavesRepository,
      useClass: PrismaSavesRepository,
    },
    SaveBusinessUseCase,
    UnsaveBusinessUseCase,
    SaveListingUseCase,
    UnsaveListingUseCase,
    GetSavedBusinessesUseCase,
    GetSavedListingsUseCase,
  ],
  exports: [ISavesRepository],
})
export class SavesModule {}
