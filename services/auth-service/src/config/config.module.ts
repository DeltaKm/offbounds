import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from './config.service';
import { REDIS_CLIENT, type RedisWithStatus } from './config.constants';

@Global()
@Module({
  providers: [
    ConfigService,
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService): Promise<RedisWithStatus> => {
        const redisUrl = config.redisUrl;
        const client = (redisUrl ? new Redis(redisUrl, { lazyConnect: true }) : new Redis({ lazyConnect: true })) as RedisWithStatus;

        client.isConnected = false;

        client.on('ready', () => {
          client.isConnected = true;
        });

        client.on('end', () => {
          client.isConnected = false;
        });

        client.on('error', () => {
          client.isConnected = false;
        });

        if (!redisUrl) {
          console.warn('Redis REDIS_URL not provided. Redis connection skipped.');
          return client;
        }

        try {
          await client.connect();
          client.isConnected = true;
          console.log('Redis connected');
        } catch (error) {
          client.isConnected = false;
          console.error('Redis NOT connected:', (error as Error).message);
        }

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [ConfigService, REDIS_CLIENT],
})
export class AppConfigModule {}
