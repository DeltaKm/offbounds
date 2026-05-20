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
});

@Injectable()
export class ConfigService {
  private config: z.infer<typeof envSchema>;

  constructor() {
    this.config = envSchema.parse({
      PORT: getEnv('PORT', '3000'),
    });
  }

  get port(): number {
    return Number(this.config.PORT);
  }
}
