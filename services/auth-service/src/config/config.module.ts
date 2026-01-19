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
        const redisUrl = config.redisUrl; 
        const host = config.redisHost;
        const port = config.redisPort;
        const db = config.redisDb;
        const password = config.redisPassword;
        const useTls = config.redisUseTls;

        const baseOptions: RedisOptions = {
          lazyConnect: true,
          ...(db !== undefined ? { db } : {}),
          ...(password ? { password } : {}),
          ...(useTls ? { tls: {} } : {}),
        };

        let client: RedisWithStatus;

        if (redisUrl) {
          client = new Redis(redisUrl, baseOptions) as RedisWithStatus;
        } else if (host) {
          client = new Redis(
            {
              host,
              port: port ?? 6379,
              ...baseOptions,
            },
          ) as RedisWithStatus;
        } else {
          // No configuration provided; return a lazy client without connecting.
          console.warn('Redis host/port not provided. Redis connection skipped.');
          client = new Redis({ lazyConnect: true }) as RedisWithStatus;
          client.isConnected = false;
          return client;
        }

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

        client
          .connect()
          .then(() => {
            client.isConnected = true;
            console.log('Redis connected');
          })
          .catch((error) => {
            client.isConnected = false;
            console.error('Redis NOT connected:', (error as Error).message);
          });

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [ConfigService, REDIS_CLIENT],
})
export class AppConfigModule {}
