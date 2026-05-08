import { Module } from '@nestjs/common';
import { VenuesController } from './delivery/http/venues.controller.js';
import { VenuesService } from './use-cases/venues.service.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { PrismaVenueRepository } from './infrastructure/prisma-venue.repository.js';
import { VENUE_REPOSITORY_TOKEN } from './core/ports/venue.repository.interface.js';

@Module({
  imports: [PrismaModule],
  controllers: [VenuesController],
  providers: [
    VenuesService,
    {
      provide: VENUE_REPOSITORY_TOKEN,
      useClass: PrismaVenueRepository,
    },
  ],
  exports: [VenuesService],
})
export class VenuesModule {}
