import { Injectable, Inject } from '@nestjs/common';
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
   * Handles the 'Discover -> Compare' segment of the product loop.
   */
  async discoverVenues(filters: GetVenuesFilterDto) {
    // Domain rules or data sanitization can happen here
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
    if (
      payload.priceRangeMin &&
      payload.priceRangeMax &&
      payload.priceRangeMin > payload.priceRangeMax
    ) {
      throw new Error('Minimum price cannot exceed maximum price');
    }

    if (payload.media && payload.media.length > 0) {
      payload.media.sort((a, b) => a.order - b.order);
    }

    return this.venueRepository.create(accountId, payload);
  }
}
