import { Injectable } from '@nestjs/common';
import { baseEnvSchema, loadEnv, getEnv, z } from '@offbounds/shared-config';

const envSchema = baseEnvSchema.extend({
  PORT: z.string().default('3000'),
});

@Injectable()
export class ConfigService {
  constructor() {
    loadEnv(envSchema);
  }

  get port(): number {
    return Number(getEnv('PORT', '3000'));
  }

  get databaseUrl(): string | undefined {
    return this.getOptionalEnv('DATABASE_URL');
  }

  get jwtAccessSecret(): string {
    return getEnv('JWT_ACCESS_SECRET');
  }

  private getOptionalEnv(key: string): string | undefined {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
      return undefined;
    }
    return value;
  }
}
