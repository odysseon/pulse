import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IBusinessTourRepository } from '../../domain/ports/business-tour.repository.port.js';
import { BusinessTour } from '../../domain/types/business-tour.entity.js';
import { CreateBusinessTourInput } from '../../domain/types/business-tour.types.js';

@Injectable()
export class CreateBusinessTourUseCase {
  constructor(
    private readonly businessTourRepo: IBusinessTourRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateBusinessTourInput): Promise<BusinessTour> {
    const business = await this.prisma.businessProfile.findUnique({
      where: { id: input.businessProfileId },
      select: { id: true, name: true, email: true },
    });

    if (!business) {
      throw new NotFoundException('Business profile not found.');
    }

    const tour = await this.businessTourRepo.create(input);

    return tour;
  }
}
