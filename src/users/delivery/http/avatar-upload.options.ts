import { BadRequestException } from '@nestjs/common';
import 'multer';

const IMAGE_MIME_RE = /^image\/(jpeg|png|gif|webp)$/;

/** 5 MB — avatars are small; enforce tightly. */
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export const avatarUploadOptions = {
  limits: { fileSize: MAX_AVATAR_SIZE },
  fileFilter: (
    _req: unknown,
    file: Express.Multer.File,
    cb: (error: Error | null, accept: boolean) => void,
  ) => {
    if (IMAGE_MIME_RE.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Only image files are accepted for avatar uploads'), false);
    }
  },
};
