import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from './config.service';
import { REDIS_CLIENT } from './config.constants';

@Global()
@Module({
  providers: [
    ConfigService,
    {
      provide: REDIS_CLIENT,
      useFactory: (config: ConfigService) => new Redis(config.redisUrl),
      inject: [ConfigService],
    },
  ],
  exports: [ConfigService, REDIS_CLIENT],
})
export class AppConfigModule {}
