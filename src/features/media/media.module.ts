import { Module } from '@nestjs/common';
import { IMediaRepository } from './domain/ports/media.repository.port.js';
import { PrismaMediaRepository } from './infrastructure/prisma-media.repository.js';
import { AddMediaUseCase } from './application/use-cases/add-media.use-case.js';
import { DeleteMediaUseCase } from './application/use-cases/delete-media.use-case.js';
import { ReorderMediaUseCase } from './application/use-cases/reorder-media.use-case.js';
import { GetResourceMediaUseCase } from './application/use-cases/get-resource-media.use-case.js';
import { MediaController } from './api/controllers/media.controller.js';

@Module({
  controllers: [MediaController],
  providers: [
    {
      provide: IMediaRepository,
      useClass: PrismaMediaRepository,
    },
    AddMediaUseCase,
    DeleteMediaUseCase,
    ReorderMediaUseCase,
    GetResourceMediaUseCase,
  ],
})
export class MediaModule {}
