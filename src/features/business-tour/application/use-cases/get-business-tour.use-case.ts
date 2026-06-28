import { Injectable, NotFoundException } from '@nestjs/common';
import { IBusinessTourRepository } from '../../domain/ports/business-tour.repository.port.js';
import { BusinessTourView } from '../../domain/types/business-tour.types.js';

@Injectable()
export class GetBusinessTourUseCase {
  constructor(private readonly businessTourRepo: IBusinessTourRepository) {}

  async execute(id: string): Promise<BusinessTourView> {
    const tour = await this.businessTourRepo.findById(id);
    if (!tour) {
      throw new NotFoundException('Store tour not found.');
    }
    return tour;
  }
}
