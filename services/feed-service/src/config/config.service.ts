import { Injectable } from '@nestjs/common';
import { baseEnvSchema, loadEnv, getEnv, z } from '@offbounds/shared-config';

const envSchema = baseEnvSchema.extend({
  CONTENT_DATABASE_URL: z.string().optional(),
  PORT: z.string().default('3002'),
});

@Injectable()
export class ConfigService {
  constructor() {
    loadEnv(envSchema);
  }

  get databaseUrl(): string | undefined {
    const value = process.env.CONTENT_DATABASE_URL;
    if (!value || value.includes('HOST') || value.includes('PORT')) {
      return undefined;
    }
    return value;
  }

  get port(): number {
    return Number(getEnv('PORT', '3002'));
  }
}
