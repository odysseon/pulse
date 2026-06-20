import { Injectable } from '@nestjs/common';
import { IStoreTourRepository } from '../../domain/ports/store-tour.repository.port.js';
import { StoreTourStatus } from '../../domain/types/store-tour.entity.js';
import { DiscoverStoreToursInput, PaginatedStoreToursSummary } from '../../domain/types/store-tour.types.js';

interface Input {
  readonly status?: StoreTourStatus;
  readonly search?: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly radius?: number;
  readonly page?: number;
  readonly limit?: number;
}

@Injectable()
export class GetStoreToursUseCase {
  constructor(private readonly storeTourRepository: IStoreTourRepository) {}

  async execute(input: Input): Promise<PaginatedStoreToursSummary> {
    const query: DiscoverStoreToursInput = {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.search !== undefined && { search: input.search }),
      ...(input.lat !== undefined && { lat: input.lat }),
      ...(input.lng !== undefined && { lng: input.lng }),
      ...(input.radius !== undefined && { radiusInKm: input.radius }),
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    return this.storeTourRepository.discoverGlobal(query);
  }
}
