import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as path from 'path';
import { Readable } from 'stream';
import { v4 as uuidv4 } from 'uuid';
import { StorageProvider, UploadParams, UploadResult } from './ports/provider.port.js';

const MAGIC_PEEK_BYTES = 12;

/**
 * Verifies file integrity via magic numbers (byte checking).
 * Operates on just the first MAGIC_PEEK_BYTES bytes of the stream.
 */
function detectMimeType(head: Buffer): string | undefined {
  if (head.length < 4) return undefined;
  if (head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47)
    return 'image/png';
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'image/jpeg';
  if (head[0] === 0x47 && head[1] === 0x49 && head[2] === 0x46 && head[3] === 0x38)
    return 'image/gif';
  if (
    head.length >= 12 &&
    head[0] === 0x52 &&
    head[1] === 0x49 &&
    head[2] === 0x46 &&
    head[3] === 0x46 &&
    head[8] === 0x57 &&
    head[9] === 0x45 &&
    head[10] === 0x42 &&
    head[11] === 0x50
  )
    return 'image/webp';
  return undefined;
}

/**
 * Accurately reads `n` bytes by accumulating chunks, resolving early if the stream ends.
 * It unshifts the exact bytes read back into the stream for downstream consumers.
 */
async function peekStream(stream: Readable, n: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let totalLength = 0;

    const cleanup = () => {
      stream.removeListener('readable', onReadable);
      stream.removeListener('end', onEnd);
      stream.removeListener('error', onError);
    };

    const onReadable = () => {
      // Pull data in a loop
      while (totalLength < n) {
        const chunk = stream.read() as Buffer | null;

        // Explicitly break if the stream is drained
        if (chunk === null) break;

        // 3. Now chunk is guaranteed to be a Buffer here
        chunks.push(chunk);
        totalLength += chunk.length;
      }

      if (totalLength >= n) {
        cleanup();
        const fullBuffer = Buffer.concat(chunks);
        stream.unshift(fullBuffer);
        resolve(fullBuffer.subarray(0, n));
      }
    };

    const onEnd = () => {
      cleanup();
      if (totalLength === 0) {
        reject(new BadRequestException('File stream is empty.'));
        return;
      }
      // If file is smaller than `n`, return what we have (magic number check will reject it if invalid)
      const fullBuffer = Buffer.concat(chunks);
      stream.unshift(fullBuffer);
      resolve(fullBuffer);
    };

    const onError = (err: Error) => {
      cleanup();
      reject(err);
    };

    stream.on('readable', onReadable);
    stream.on('end', onEnd);
    stream.on('error', onError);

    stream.pause();
    onReadable(); // Kickstart
  });
}

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);
  private readonly allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

  constructor(private readonly storageProvider: StorageProvider) {}

  public async uploadNewImage(params: UploadParams): Promise<UploadResult> {
    const extension = path.extname(params.fileName).toLowerCase();

    if (!this.allowedExtensions.includes(extension)) {
      throw new BadRequestException(`${extension} is not a supported image format.`);
    }

    const head = await peekStream(params.fileData, MAGIC_PEEK_BYTES);

    const mime = detectMimeType(head);
    if (!mime || !this.allowedMimeTypes.includes(mime)) {
      throw new BadRequestException('The file content is not a valid image.');
    }

    const safeFileName = `${uuidv4()}${extension}`;

    return await this.storageProvider.upload({
      ...params,
      fileName: safeFileName,
    });
  }

  /**
   * Direct deletion for manual cleanup, account removal, or orchestrated replacements
   * triggered by domain services (e.g., UsersService, VenuesService).
   */
  public async deleteImage(fileId: string) {
    try {
      const result = await this.storageProvider.delete(fileId);
      if (!result.success) {
        this.logger.warn(`File cleanup failed for ID: ${fileId}`);
      }
      return result;
    } catch (error) {
      this.logger.error(`Exception during cleanup for ID: ${fileId}`, error);
      return { success: false, message: 'Internal cleanup exception' };
    }
  }
}
