import {
  Controller,
  Post,
  Put,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Readable } from 'stream';
import { ImageStorageService } from '../../image-storage.service.js';
import { UploadMediaDto, ReplaceMediaDto, MediaFolderType } from './dto/upload-media.dto.js';
import type { Express } from 'express';

@ApiTags('Media')
@Controller('media')
export class MediaController {
  /**
   * Secure internal mapping of domain categories to storage paths.
   */
  private readonly folderMap: Record<MediaFolderType, string> = {
    AVATAR: 'users/avatars',
    VENUE_GALLERY: 'venues/galleries',
  };

  constructor(private readonly imageStorage: ImageStorageService) {}

  /**
   * Upload a brand new image to a specific domain folder.
   *
   * @param body - Contains the destination folder type.
   * @param file - The binary file data from multipart/form-data.
   * @returns The public URL and management fileId.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadFile(@Body() body: UploadMediaDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const fileStream = Readable.from(file.buffer);

    return await this.imageStorage.uploadNewImage({
      destination: this.folderMap[body.folderType],
      fileName: file.originalname,
      fileData: fileStream,
    });
  }

  /**
   * Replace an existing image with a new one.
   * Performs an atomic-like replacement: uploads the new image first,
   * then cleans up the old file ID.
   *
   * @param body - Contains the folder type and the ID of the file to replace.
   * @param file - The new binary file data.
   * @returns The updated public URL and new management fileId.
   */
  @Put('replace')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async replaceFile(@Body() body: ReplaceMediaDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const fileStream = Readable.from(file.buffer);

    return await this.imageStorage.replaceImage(
      {
        destination: this.folderMap[body.folderType],
        fileName: file.originalname,
        fileData: fileStream,
      },
      body.oldFileId,
    );
  }
}
