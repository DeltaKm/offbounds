import { Injectable } from '@nestjs/common';
import { z } from 'zod';

const configSchema = z.object({
  PORT: z.string().default('3000'),
  DATABASE_URL: z.string().optional(),
  SMS_PROVIDER: z.enum(['twilio', 'mock']).default('mock'),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
});

type Config = z.infer<typeof configSchema>;

@Injectable()
export class ConfigService {
  private readonly config: Config;

  constructor() {
    const env = {
      PORT: process.env.PORT,
      DATABASE_URL: process.env.DATABASE_URL,
      SMS_PROVIDER: process.env.SMS_PROVIDER,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
    };

    this.config = configSchema.parse(env);
  }

  get port(): number {
    return parseInt(this.config.PORT, 10);
  }

  get databaseUrl(): string | undefined {
    return this.config.DATABASE_URL;
  }

  get smsProvider(): 'twilio' | 'mock' {
    return this.config.SMS_PROVIDER;
  }

  get twilioAccountSid(): string | undefined {
    return this.config.TWILIO_ACCOUNT_SID;
  }

  get twilioAuthToken(): string | undefined {
    return this.config.TWILIO_AUTH_TOKEN;
  }

  get twilioPhoneNumber(): string | undefined {
    return this.config.TWILIO_PHONE_NUMBER;
  }
}
