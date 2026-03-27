import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import mongoose, { Connection, Model, Schema } from 'mongoose';
import { ConfigService } from '../config/config.service';

// da sincronizzare con gli altri mircoservizi
const RETRY_DELAY_MS = 5000;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private connection?: Connection;
  private retryHandle?: NodeJS.Timeout;
  private dbReady = false;
  private connecting = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing MongoDB connection');
    await this.tryConnect();
  }

  async onModuleDestroy() {
    if (this.retryHandle) {
      clearTimeout(this.retryHandle);
    }
    await this.closeConnection();
  }

  isDbReady(): boolean {
    return this.dbReady;
  }

  getModel<T>(name: string, schema: Schema<T>): Model<T> | undefined {
    if (!this.connection) {
      return undefined;
    }

    try {
      return this.connection.model<T>(name);
    } catch (error) {
      return this.connection.model<T>(name, schema);
    }
  }

  private async tryConnect() {
    if (this.connecting) {
      return;
    }

    this.connecting = true;

    const uri = this.configService.databaseUrl;
    if (!uri) {
      this.logger.warn('CONTENT_DATABASE_URL not provided. Running without MongoDB connection.');
      this.dbReady = false;
      this.connecting = false;
      return;
    }

    try {
      await this.closeConnection();
      const connection = await mongoose.createConnection(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      await connection.asPromise();

      this.logger.log('MongoDB connected');
      this.connection = connection;
      this.dbReady = true;
      if (this.retryHandle) {
        clearTimeout(this.retryHandle);
        this.retryHandle = undefined;
      }

      connection.on('disconnected', () => {
        this.logger.warn('MongoDB disconnected. Attempting to reconnect.');
        this.dbReady = false;
        this.scheduleRetry();
      });

      connection.on('error', (err) => {
        this.logger.error(`MongoDB error: ${err.message}`);
        if (connection.readyState !== 1) {
          this.dbReady = false;
          this.scheduleRetry();
        }
      });
    } catch (error) {
      this.logger.error(`MongoDB connection failed: ${(error as Error).message}`);
      this.dbReady = false;
      await this.closeConnection();
      this.scheduleRetry();
    } finally {
      this.connecting = false;
    }
  }

  private scheduleRetry() {
    if (this.retryHandle) {
      return;
    }

    this.retryHandle = setTimeout(() => {
      this.retryHandle = undefined;
      this.tryConnect().catch((error) => {
        this.logger.error(`Retry connection attempt failed: ${(error as Error).message}`);
        this.scheduleRetry();
      });
    }, RETRY_DELAY_MS);
  }

  private async closeConnection() {
    if (!this.connection) {
      return;
    }

    try {
      await this.connection.close();
    } catch (error) {
      this.logger.error(`Error closing MongoDB connection: ${(error as Error).message}`);
    } finally {
      this.connection = undefined;
      this.dbReady = false;
    }
  }
}
