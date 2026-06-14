import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';

@Injectable()
export class CreateBusinessDraftUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(ownerId: string, data: Record<string, unknown>) {
    return this.prisma.businessProfileDraft.create({
      data: {
        ownerId,
        data,
      },
    });
  }
}
