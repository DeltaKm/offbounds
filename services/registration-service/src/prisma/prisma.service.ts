import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '../config/config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private isConnected = false;

  constructor(private readonly config: ConfigService) {
    super();
    const databaseUrl = this.config.databaseUrl;
    if (databaseUrl) {
      process.env.DATABASE_URL = databaseUrl;
    }
  }

  async onModuleInit() {
    const databaseUrl = this.config.databaseUrl;
    if (!databaseUrl) {
      console.warn('Postgres DATABASE_URL not provided. Prisma connection skipped.');
      this.isConnected = false;
      return;
    }

    try {
      await this.$connect();
      console.log('Registration-service Postgres connected');
      this.isConnected = true;
    } catch (error) {
      console.error('Registration-service Postgres NOT connected:', (error as Error).message);
      this.isConnected = false;
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
