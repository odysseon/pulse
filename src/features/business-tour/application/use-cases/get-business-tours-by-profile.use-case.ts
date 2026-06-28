import { Injectable } from '@nestjs/common';
import { IBusinessTourRepository } from '../../domain/ports/business-tour.repository.port.js';
import {
  DiscoverBusinessToursInput,
  PaginatedBusinessTours,
} from '../../domain/types/business-tour.types.js';

@Injectable()
export class GetBusinessToursByProfileUseCase {
  constructor(private readonly businessTourRepo: IBusinessTourRepository) {}

  async execute(input: DiscoverBusinessToursInput): Promise<PaginatedBusinessTours> {
    return this.businessTourRepo.discover(input);
  }
}
