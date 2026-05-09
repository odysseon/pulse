import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Readable } from 'stream';
import { ImageStorageService } from '../../image-storage.service.js';
import { UploadMediaDto, MediaFolderType } from './dto/upload-media.dto.js';
import 'multer';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const imageUploadOptions = {
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype.match(/^image\/(jpeg|png|gif|webp)$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
};

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
  @UseInterceptors(FileInterceptor('file', imageUploadOptions))
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
}
