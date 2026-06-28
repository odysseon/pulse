import { Injectable } from '@nestjs/common';
import { IBusinessTourRepository } from '../../domain/ports/business-tour.repository.port.js';
import { BusinessTourStatus } from '../../domain/types/business-tour.entity.js';
import {
  DiscoverBusinessToursInput,
  PaginatedBusinessToursSummary,
} from '../../domain/types/business-tour.types.js';

interface Input {
  readonly status?: BusinessTourStatus;
  readonly search?: string;
  readonly lat?: number;
  readonly lng?: number;
  readonly radius?: number;
  readonly page?: number;
  readonly limit?: number;
}

@Injectable()
export class GetBusinessToursUseCase {
  constructor(private readonly businessTourRepository: IBusinessTourRepository) {}

  async execute(input: Input): Promise<PaginatedBusinessToursSummary> {
    const query: DiscoverBusinessToursInput = {
      ...(input.status !== undefined && { status: input.status }),
      ...(input.search !== undefined && { search: input.search }),
      ...(input.lat !== undefined && { lat: input.lat }),
      ...(input.lng !== undefined && { lng: input.lng }),
      ...(input.radius !== undefined && { radiusInKm: input.radius }),
      page: input.page ?? 1,
      limit: input.limit ?? 20,
    };

    return this.businessTourRepository.discoverGlobal(query);
  }
}
