import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  StorageProvider,
  UploadParams,
  UploadResult,
  DeleteResult,
} from '../../ports/provider.port.js';
import { BACKBLAZE_CLIENT, BACKBLAZE_CONFIG, type BackblazeConfig } from './backblaze.provider.js';

@Injectable()
export class BackblazeStorageProvider implements StorageProvider {
  private readonly logger = new Logger(BackblazeStorageProvider.name);

  constructor(
    @Inject(BACKBLAZE_CLIENT) private readonly s3Client: S3Client,
    @Inject(BACKBLAZE_CONFIG) private readonly config: BackblazeConfig,
  ) {}

  async upload(params: UploadParams): Promise<UploadResult> {
    try {
      //  Build the exact key from the generic params
      const key = `${params.destination}/${params.fileName}`;

      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: this.config.bucketName,
          Key: key,
          Body: params.fileData,
        },
        partSize: 10 * 1024 * 1024,
        queueSize: 3,
      });

      await upload.done();

      const baseUrl =
        this.config.publicUrlBase || `${this.config.endpoint}/file/${this.config.bucketName}`;

      // Return both the delivery URL and the management ID (the Key)
      return {
        url: `${baseUrl}/${key}`,
        fileId: key,
      };
    } catch (error) {
      this.logger.error('Backblaze Upload Error:', error);
      throw new InternalServerErrorException('Failed to upload file to Backblaze.');
    }
  }

  async delete(fileId: string): Promise<DeleteResult> {
    try {
      // Domain leak fixed: We blindly trust the fileId provided by the database
      const command = new DeleteObjectCommand({
        Bucket: this.config.bucketName,
        Key: fileId,
      });

      await this.s3Client.send(command);
      this.logger.log(`Deleted file from Backblaze: ${fileId}`);

      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown storage error';

      this.logger.error('Backblaze Delete Error:', error);

      return {
        success: false,
        message: errorMessage,
      };
    }
  }
}
