import {
  Controller,
  Post,
  Param,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Readable } from 'stream';
import { CurrentIdentity, type RequestIdentity } from '@odysseon/whoami-adapter-nestjs';
import { PrismaService } from '../../../../prisma/prisma.service.js';
import { UploadBusinessLogoUseCase } from '../../application/use-cases/upload-business-logo.use-case.js';
import { UploadBusinessBannerUseCase } from '../../application/use-cases/upload-business-banner.use-case.js';
import { BusinessProfileResponseDto } from '../dto/response.dto.js';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('businesses branding')
@Controller('businesses')
export class BusinessBrandingController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadLogo: UploadBusinessLogoUseCase,
    private readonly uploadBanner: UploadBusinessBannerUseCase,
  ) {}

  @Post(':id/logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogoExec(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<BusinessProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const userId = await this.resolveUserId(identity.accountId);

    const profile = await this.uploadLogo.execute({
      businessId: id,
      requesterId: userId,
      fileName: file.originalname,
      fileStream: Readable.from(file.buffer),
    });

    return BusinessProfileResponseDto.from(profile);
  }

  @Post(':id/banner')
  @UseInterceptors(FileInterceptor('file'))
  async uploadBannerExec(
    @CurrentIdentity() identity: RequestIdentity,
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<BusinessProfileResponseDto> {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    const userId = await this.resolveUserId(identity.accountId);

    const profile = await this.uploadBanner.execute({
      businessId: id,
      requesterId: userId,
      fileName: file.originalname,
      fileStream: Readable.from(file.buffer),
    });

    return BusinessProfileResponseDto.from(profile);
  }

  private async resolveUserId(accountId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { id: true },
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    return user.id;
  }
}
