import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';
import { MediaStorageService } from '../../storage/media-storage.service.js';
import {
  USER_REPOSITORY_TOKEN,
  type IUserRepository,
} from '../core/ports/user.repository.interface.js';
import 'multer';

@Injectable()
export class UploadUserAvatarUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: IUserRepository,
    private readonly mediaStorage: MediaStorageService,
  ) {}

  async execute(accountId: string, file: Express.Multer.File): Promise<unknown> {
    const user = await this.userRepository.findByAccountId(accountId);
    if (!user) throw new NotFoundException('User not found');

    const { url, fileId } = await this.mediaStorage.uploadNewMedia({
      destination: 'users/avatars',
      fileName: file.originalname,
      fileData: Readable.from(file.buffer),
    });

    const oldAvatarId = user.avatarId;
    const updated = await this.userRepository.updateProfile(accountId, {
      avatarUrl: url,
      avatarId: fileId,
    });

    if (oldAvatarId) {
      await this.mediaStorage.deleteMedia(oldAvatarId);
    }

    return updated;
  }
}
