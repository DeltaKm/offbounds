import { Injectable } from '@nestjs/common';
import { baseEnvSchema, loadEnv, getEnv, z } from '@offbounds/shared-config';

const envSchema = baseEnvSchema.extend({
  ACCESS_TOKEN_TTL: z.string().default("900"),          // 15min
  REFRESH_TOKEN_TTL: z.string().default("2592000"),     // 30 giorni
  EMAIL_TOKEN_TTL: z.string().default("600"),           // 10 min
  PASSWORD_RESET_TOKEN_TTL: z.string().default("3600"), // 1 ora
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

  private getOptionalEnv(key: string) {
    const value = process.env[key];
    if (!value || value.trim().length === 0) {
      return undefined;
    }
    return value;
  }
}
