import { ConfigService } from '@nestjs/config';
import { Provider, Logger } from '@nestjs/common';
import { S3Client } from '@aws-sdk/client-s3';

export const BACKBLAZE_CLIENT = 'BACKBLAZE_CLIENT';
export const BACKBLAZE_CONFIG = 'BACKBLAZE_CONFIG';

export interface BackblazeConfig {
  bucketName: string;
  endpoint: string;
  publicUrlBase?: string;
}

export const BackblazeClientProvider: Provider = {
  provide: BACKBLAZE_CLIENT,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): S3Client | undefined => {
    const logger = new Logger('BackblazeClientProvider');

    let endpoint = configService.get<string>('B2_ENDPOINT');
    const region = configService.get<string>('B2_REGION');
    const accessKeyId = configService.get<string>('B2_APPLICATION_KEY_ID');
    const secretAccessKey = configService.get<string>('B2_APPLICATION_KEY');
    if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
      return undefined;
    }

    if (endpoint && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    logger.log('🔧 Backblaze B2 Configuration:', {
      endpoint,
      region,
      bucketName: configService.get<string>('B2_BUCKET_NAME'),
      hasKeyId: !!accessKeyId,
      hasSecretKey: !!secretAccessKey,
    });

    return new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true,
    });
  },
};

export const BackblazeConfigProvider: Provider = {
  provide: BACKBLAZE_CONFIG,
  inject: [ConfigService],
  useFactory: (configService: ConfigService): BackblazeConfig => {
    let endpoint = configService.get<string>('B2_ENDPOINT', '');

    if (endpoint && !endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      endpoint = `https://${endpoint}`;
    }

    return {
      bucketName: configService.get<string>('B2_BUCKET_NAME', ''),
      endpoint,
      publicUrlBase: configService.get<string>('B2_PUBLIC_URL_BASE'),
    };
  },
};
