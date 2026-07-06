import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  public isConnected = false;

  constructor(private config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.databaseUrl,
        },
      },
    });
  }

  async onModuleInit() {
    if (!this.config.databaseUrl) {
      console.warn('DATABASE_URL not provided. Prisma connection skipped.');
      this.isConnected = false;
      return;
    }

    try {
      await this.$connect();
      console.log('Postgres connected');
      this.isConnected = true;
    } catch (error) {
      console.error('Postgres NOT connected:', (error as Error).message);
      this.isConnected = false;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
