import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IStoreTourRepository } from '../../domain/ports/store-tour.repository.port.js';
import { StoreTour } from '../../domain/types/store-tour.entity.js';
import { CreateStoreTourInput } from '../../domain/types/store-tour.types.js';

@Injectable()
export class CreateStoreTourUseCase {
  constructor(
    private readonly storeTourRepo: IStoreTourRepository,
    private readonly prisma: PrismaService,
  ) {}

  async execute(input: CreateStoreTourInput): Promise<StoreTour> {
    const business = await this.prisma.businessProfile.findUnique({
      where: { id: input.businessProfileId },
      select: { id: true },
    });

    if (!business) {
      throw new NotFoundException('Business profile not found.');
    }

    return this.storeTourRepo.create(input);
  }
}
