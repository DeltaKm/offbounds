import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
import { ConfigService } from './config.service';
import { REDIS_CLIENT } from './config.constants';
import type { RedisWithStatus } from './config.constants';


@Global()
@Module({
  providers: [
    ConfigService,
    {
      provide: REDIS_CLIENT,
      useFactory: async (config: ConfigService): Promise<RedisWithStatus> => {
        const host = config.redisHost;
        const port = config.redisPort ?? 6379;
        const db = config.redisDb ?? 0;
        const password = config.redisPassword;
        const tlsEnabled = String(process.env.REDIS_TLS).toLowerCase() === 'true';

        if (!host) {
          console.warn('Redis host/port not provided. Redis connection skipped.');
          const fallback = new Redis({ lazyConnect: true }) as RedisWithStatus;
          fallback.isConnected = false;
          return fallback;
        }

        const client = new Redis({
          host,
          port,
          password,
          db,
          ...(tlsEnabled ? { tls: { rejectUnauthorized: false } } : {}),
          lazyConnect: true,
          enableReadyCheck: true,
          maxRetriesPerRequest: 1,
          retryStrategy: () => null,
        }) as RedisWithStatus;

        client.isConnected = false;

        client.on('ready', () => {
          client.isConnected = true;
          console.log('Redis connected');
        });

        client.on('end', () => {
          client.isConnected = false;
          console.log('Redis connection closed');
        });

        client.on('error', (error) => {
          client.isConnected = false;
          console.error(`Redis error: ${(error as Error).message}`);
        });

        (async () => {
          try {
            await client.connect();
          } catch (error) {
            client.isConnected = false;
            console.error(`Redis error: ${(error as Error).message}`);
          }
        })();

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [ConfigService, REDIS_CLIENT],
})
export class AppConfigModule {}
