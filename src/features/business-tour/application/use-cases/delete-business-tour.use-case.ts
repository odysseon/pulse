import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { IBusinessTourRepository } from '../../domain/ports/business-tour.repository.port.js';
import { MediaStorageService } from '../../../../storage/media-storage.service.js';

@Injectable()
export class DeleteBusinessTourUseCase {
  constructor(
    private readonly businessTourRepo: IBusinessTourRepository,
    private readonly storage: MediaStorageService,
    private readonly prisma: PrismaService,
  ) {}

  async execute(id: string): Promise<void> {
    const tour = await this.businessTourRepo.findById(id);
    if (!tour) {
      throw new NotFoundException('Store tour not found.');
    }

    // Fetch all media attached to this store tour for storage cleanup
    const mediaItems = await this.prisma.media.findMany({
      where: { businessTourId: id },
      select: { fileId: true },
    });

    await this.businessTourRepo.delete(id);

    // Clean up storage assets after DB is consistent (non-fatal)
    await Promise.allSettled(
      mediaItems.map((m) =>
        this.storage.deleteMedia(m.fileId).catch(() => {
          // TODO: log orphaned storage asset for async cleanup
        }),
      ),
    );
  }
}
