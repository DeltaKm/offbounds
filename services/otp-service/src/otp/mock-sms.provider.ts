import { Injectable } from '@nestjs/common';
import { SmsProvider } from './sms-provider.interface';

@Injectable()
export class MockSmsProvider implements SmsProvider {
  async sendOtp(phoneNumber: string, code: string): Promise<void> {
    console.log(`[MOCK SMS] Sending OTP ${code} to ${phoneNumber}`);
  }
}
