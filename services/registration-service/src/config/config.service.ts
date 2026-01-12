import { Injectable } from '@nestjs/common';
import { baseEnvSchema, loadEnv, getEnv, z } from '@offbounds/shared-config';

const envSchema = baseEnvSchema.extend({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
});

@Injectable()
export class ConfigService {
  constructor() {
    loadEnv(envSchema);
  }

  get port(): number {
    return Number(getEnv('PORT', '3000'));
  }

  get databaseUrl(): string {
    return getEnv('DATABASE_URL');
  }
}
