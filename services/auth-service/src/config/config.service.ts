import { Injectable } from '@nestjs/common';
import { baseEnvSchema, loadEnv, getEnv, z } from '@offbounds/shared-config';

const envSchema = baseEnvSchema.extend({
  ACCESS_TOKEN_TTL: z.string().default("900"),
  REFRESH_TOKEN_TTL: z.string().default("2592000"),
  EMAIL_TOKEN_TTL: z.string().default("600"),
  PASSWORD_RESET_TOKEN_TTL: z.string().default("3600"),
  PORT: z.string().default('3002'),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().optional(),
  REDIS_DB: z.string().optional(),
  REDIS_TLS: z.string().optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_URL: z.string().optional(), // fallback only
});



@Injectable()
export class ConfigService {
  constructor() {
    loadEnv(envSchema);
  }

  get databaseUrl() {
    return this.getOptionalEnv('DATABASE_URL');
  }

  get jwtAccessSecret() {
    return getEnv('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret() {
    return getEnv('JWT_REFRESH_SECRET');
  }

  get redisUrl() {
    return this.getOptionalEnv('REDIS_URL');
  }

  get redisHost() {
    return this.getOptionalEnv('REDIS_HOST');
  }

  get redisPort(): number | undefined {
    const value = this.getOptionalEnv('REDIS_PORT');
    return value ? Number(value) : undefined;
  }

  get redisDb(): number | undefined {
    const value = this.getOptionalEnv('REDIS_DB');
    return value ? Number(value) : undefined;
  }

  get redisPassword(): string | undefined {
    return this.getOptionalEnv('REDIS_PASSWORD');
  }

  get redisUseTls(): boolean {
    const value = this.getOptionalEnv('REDIS_TLS');
    return value === 'true';
  }

  get accessTokenTtlSeconds() {
    const value = getEnv('ACCESS_TOKEN_TTL', `${15 * 60}`);
    return Number(value);
  }

  get refreshTokenTtlSeconds() {
    const value = getEnv('REFRESH_TOKEN_TTL', `${30 * 24 * 60 * 60}`);
    return Number(value);
  }

  get emailVerificationTokenTtlSeconds() {
    const value = getEnv('EMAIL_TOKEN_TTL', `${24 * 60 * 60}`);
    return Number(value);
  }

  get passwordResetTokenTtlSeconds() {
    const value = getEnv('PASSWORD_RESET_TOKEN_TTL', `${60 * 60}`);
    return Number(value);
  }

  get port() {
    return Number(getEnv('PORT', '3002'));
  }

  private getOptionalEnv(key: string) {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
      return undefined;
    }
    return value;
  }
}
