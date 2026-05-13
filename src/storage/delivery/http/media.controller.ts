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
import { MediaStorageService } from '../../media-storage.service.js';
import { UploadMediaDto, MediaFolderType } from './dto/upload-media.dto.js';
import 'multer';

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const mediaUploadOptions = {
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (file.mimetype.match(/^(image\/(jpeg|png|gif|webp)|video\/(mp4|webm|quicktime))$/)) {
      cb(null, true);
    } else {
      cb(new BadRequestException(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
};

@ApiTags('Media')
@Controller('media')
export class MediaController {
  private readonly folderMap: Record<MediaFolderType, string> = {
    AVATAR: 'users/avatars',
    LISTING_GALLERY: 'listings/galleries',
  };

  constructor(private readonly mediaStorage: MediaStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', mediaUploadOptions))
  @ApiConsumes('multipart/form-data')
  async uploadFile(@Body() body: UploadMediaDto, @UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');

    const fileStream = Readable.from(file.buffer);

    return await this.mediaStorage.uploadNewMedia({
      destination: this.folderMap[body.folderType],
      fileName: file.originalname,
      fileData: fileStream,
    });
  }
}
