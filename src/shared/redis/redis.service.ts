import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = new Redis({
      ...(host !== undefined && { host }),
      ...(port !== undefined && { port }),
      ...(password !== undefined && { password }),
    });

    this.client.on('error', (err) => {
      this.logger.error('Redis connection error', err);
    });
  }

  getClient(): Redis {
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      this.logger.error(`Error getting cache key ${key}`, err);
      return null;
    }
  }

  async set<T>(key: string, value: T, baseTtlSeconds: number = 3600): Promise<void> {
    try {
      // Add random jitter between 0 and 20% of base TTL to prevent cache stampede
      const jitter = Math.floor(Math.random() * (baseTtlSeconds * 0.2));
      const finalTtl = baseTtlSeconds + jitter;
      
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized, 'EX', finalTtl);
    } catch (err) {
      this.logger.error(`Error setting cache key ${key}`, err);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (err) {
      this.logger.error(`Error deleting cache key ${key}`, err);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [nextCursor, keys] = await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
        cursor = nextCursor;
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.error(`Error deleting cache pattern ${pattern}`, err);
    }
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
