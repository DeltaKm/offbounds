import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import { loadEnv, getEnv } from '@offbounds/shared-config';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(32),
  REDIS_URL: z.string(),
  ACCESS_TOKEN_TTL: z.string().optional(),
  REFRESH_TOKEN_TTL: z.string().optional(),
  EMAIL_TOKEN_TTL: z.string().optional(),
  PASSWORD_RESET_TOKEN_TTL: z.string().optional()
});

@Injectable()
export class ConfigService {
  constructor() {
    loadEnv(envSchema);
  }

  get databaseUrl() {
    return getEnv('DATABASE_URL');
  }

  get jwtAccessSecret() {
    return getEnv('JWT_ACCESS_SECRET');
  }

  get jwtRefreshSecret() {
    return getEnv('JWT_REFRESH_SECRET');
  }

  get redisUrl() {
    return getEnv('REDIS_URL');
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
}
