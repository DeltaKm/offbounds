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
}
