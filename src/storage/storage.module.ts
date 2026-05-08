import { DynamicModule, Module, Global, Logger, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';

//  Port & Application Service
import { StorageProvider } from './ports/provider.port.js';
import { ImageStorageService } from './image-storage.service.js';

import { CloudinaryProvider } from './adapters/cloudinary/cloudinary.provider.js';
import { CloudinaryStorageProvider } from './adapters/cloudinary/cloudinary.adapter.js';

import {
  BackblazeClientProvider,
  BackblazeConfigProvider,
} from './adapters/backblaze/backblaze.provider.js';
import { BackblazeStorageProvider } from './adapters/backblaze/backblaze.adapter.js';

@Global()
@Module({
  imports: [ConfigModule],
})
export class StorageModule {
  static register(): DynamicModule {
    const logger = new Logger('StorageModule');

    // Evaluate the environment before DI resolves
    const activeProvider = process.env.STORAGE_PROVIDER;

    // The ImageStorageService is always required
    const providers: Provider[] = [ImageStorageService];

    logger.log(`📦 Bootstrapping Storage Module. Active Provider: ${activeProvider || 'UNSET'}`);

    if (activeProvider === 'cloudinary') {
      providers.push(CloudinaryProvider, CloudinaryStorageProvider, {
        provide: StorageProvider,
        useExisting: CloudinaryStorageProvider,
      });
    } else if (activeProvider === 'backblaze') {
      providers.push(BackblazeConfigProvider, BackblazeClientProvider, BackblazeStorageProvider, {
        provide: StorageProvider,
        useExisting: BackblazeStorageProvider,
      });
    } else {
      throw new Error(
        'CRITICAL: Invalid or missing STORAGE_PROVIDER environment variable. Must be "cloudinary" or "backblaze".',
      );
    }

    return {
      module: StorageModule,
      providers: providers,
      exports: [ImageStorageService, StorageProvider],
    };
  }
}
