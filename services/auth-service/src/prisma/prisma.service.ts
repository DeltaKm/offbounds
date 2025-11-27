import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '../config';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  isConnected = false;

  constructor(private readonly config: ConfigService) {
    if (config.databaseUrl) {
      process.env.DATABASE_URL = config.databaseUrl;
    }
    super();
  }

  async onModuleInit() {
    if (!this.config.databaseUrl) {
      console.warn('Postgres DATABASE_URL not provided. Prisma connection skipped.');
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
      // Do not throw to keep the service running without Postgres
    }
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.$disconnect();
    }
  }

  async enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', async () => {
      await app.close();
    });
  }
}
