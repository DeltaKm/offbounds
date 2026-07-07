import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (!value && !fallback) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value || fallback!;
};

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1),
  EPOCH_API_URL: z.string().optional(),
  EPOCH_API_KEY: z.string().optional(),
  EPOCH_MERCHANT_ID: z.string().optional(),
});

@Injectable()
export class ConfigService {
  private config: z.infer<typeof envSchema>;

  constructor() {
    this.config = envSchema.parse({
      PORT: getEnv('PORT', '3000'),
      DATABASE_URL: getEnv('DATABASE_URL'),
      EPOCH_API_URL: getEnv('EPOCH_API_URL'),
      EPOCH_API_KEY: getEnv('EPOCH_API_KEY'),
      EPOCH_MERCHANT_ID: getEnv('EPOCH_MERCHANT_ID'),
    });
  }

  get port(): number {
    return Number(this.config.PORT);
  }

  get databaseUrl(): string {
    return this.config.DATABASE_URL;
  }

  get(key: string): string | undefined {
    return this.config[key as keyof typeof this.config] as string | undefined;
  }
}
