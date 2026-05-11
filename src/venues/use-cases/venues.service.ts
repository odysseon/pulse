import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { GetVenuesFilterDto } from '../delivery/http/dto/get-venues-filter.dto.js';
import { CreateVenueDto } from '../delivery/http/dto/create-venue.dto.js';
import {
  type IVenueRepository,
  VENUE_REPOSITORY_TOKEN,
} from '../core/ports/venue.repository.interface.js';

@Injectable()
export class VenuesService {
  constructor(
    @Inject(VENUE_REPOSITORY_TOKEN)
    private readonly venueRepository: IVenueRepository,
  ) {}

  /**
   * Discovers event centres based on public filter criteria.
   */
  async discoverVenues(filters: GetVenuesFilterDto) {
    const result = await this.venueRepository.findMany(filters);

    return {
      meta: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
      },
      data: result.data,
    };
  }

  /**
   * Registers a new event centre under a venue owner's account.
   */
  async createVenue(accountId: string, payload: CreateVenueDto) {
    // Check against null/undefined to allow 0 as a valid price
    if (payload.priceRangeMin != null && payload.priceRangeMax != null) {
      if (payload.priceRangeMin > payload.priceRangeMax) {
        throw new BadRequestException('Minimum price cannot exceed maximum price');
      }
    }

    // Sort media by order to ensure deterministic "main image" selection
    if (payload.media && payload.media.length > 0) {
      payload.media.sort((a, b) => a.order - b.order);
    }

    return this.venueRepository.create(accountId, payload);
  }

  async getVenue(venueId: string) {
    return await this.venueRepository.findById(venueId);
  }

  async updateVenue(venueId: string, accountId: string, payload: Partial<CreateVenueDto>) {
    return await this.venueRepository.update(venueId, accountId, payload);
  }
}
