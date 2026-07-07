import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { SmsProvider } from './sms-provider.interface';

export type OtpPurpose = 'registration' | 'login' | 'password_reset';

const OTP_LENGTH = 7;
const OTP_EXPIRY_SECONDS = 5 * 60;
const OTP_COOLDOWN_SECONDS = 120;
const MAX_ATTEMPTS = 5;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsProvider: SmsProvider,
  ) {}

  async generateOtp(phoneNumber: string, purpose: OtpPurpose): Promise<void> {
    const cooldown = await this.checkCooldown(phoneNumber, purpose);
    if (cooldown > 0) {
      throw new BadRequestException(`Please wait ${cooldown} seconds before requesting a new OTP`);
    }

    await this.prisma.otpCode.updateMany({
      where: {
        phoneNumber,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { usedAt: new Date() },
    });

    const code = this.generateCode();
    const codeHash = await argon2.hash(code);
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);

    await this.prisma.otpCode.create({
      data: {
        phoneNumber,
        codeHash,
        purpose,
        expiresAt,
      },
    });

    await this.smsProvider.sendOtp(phoneNumber, code);
  }

  async validateOtp(phoneNumber: string, code: string, purpose: OtpPurpose): Promise<boolean> {
    const otpRecord = await this.prisma.otpCode.findFirst({
      where: {
        phoneNumber,
        purpose,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      throw new NotFoundException('Invalid or expired OTP');
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw new BadRequestException('Too many failed attempts. Please request a new OTP');
    }

    const isValid = await argon2.verify(otpRecord.codeHash, code);

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: {
        attempts: otpRecord.attempts + 1,
        lastAttemptAt: new Date(),
      },
    });

    if (!isValid) {
      throw new BadRequestException('Invalid OTP');
    }

    await this.prisma.otpCode.update({
      where: { id: otpRecord.id },
      data: { usedAt: new Date() },
    });

    return true;
  }

  private async checkCooldown(phoneNumber: string, purpose: OtpPurpose): Promise<number> {
    const lastOtp = await this.prisma.otpCode.findFirst({
      where: {
        phoneNumber,
        purpose,
        createdAt: { gt: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000) },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!lastOtp) return 0;

    const elapsed = Date.now() - lastOtp.createdAt.getTime();
    const remaining = OTP_COOLDOWN_SECONDS - Math.floor(elapsed / 1000);
    return Math.max(0, remaining);
  }

  private generateCode(): string {
    const code = randomBytes(4).readUInt32BE(0) % 10000000;
    return code.toString().padStart(OTP_LENGTH, '0');
  }
}
