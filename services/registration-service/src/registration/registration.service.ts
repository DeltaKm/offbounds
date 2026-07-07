import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from '@offbounds/otp-service';
import { RegisterUserDto } from './dto/register-user.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestEmailVerificationDto } from './dto/request-email-verification.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class RegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otpService: OtpService,
  ) {}

  async register(dto: RegisterUserDto) {
    const conflictField = await this.findExistingField(dto.email, dto.username, dto.phoneNumber);
    if (conflictField) {
      throw new ConflictException(`${conflictField} already in use`);
    }

    const { hash, salt } = await this.hashPassword(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          username: dto.username,
          phoneNumber: dto.phoneNumber,
          auth: {
            create: {
              passwordHash: hash,
              passwordSalt: salt,
            },
          },
        },
        include: { auth: true },
      });

      await this.otpService.generateOtp(user.phoneNumber, 'registration');

      return {
        id: user.id,
        email: user.email,
        username: user.username,
        phoneNumber: user.phoneNumber,
        isEmailVerified: user.auth?.isEmailVerified ?? false,
        createdAt: user.createdAt,
      };
    } catch (error: unknown) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        const target = Array.isArray(error.meta?.target) ? error.meta?.target[0] : 'field';
        throw new ConflictException(`${target} already in use`);
      }
      throw new InternalServerErrorException('Unable to create user');
    }
  }

  async sendRegistrationOtp(phoneNumber: string) {
    await this.otpService.generateOtp(phoneNumber, 'registration');
    return { message: 'OTP sent' };
  }

  async verifyRegistrationOtp(phoneNumber: string, code: string) {
    const isValid = await this.otpService.validateOtp(phoneNumber, code, 'registration');
    return { valid: isValid };
  }

  async requestEmailVerification(dto: RequestEmailVerificationDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { auth: true },
    });

    if (!user || !user.auth) {
      throw new NotFoundException('User not found');
    }

    if (user.auth.isEmailVerified) {
      return { message: 'Email already verified' };
    }

    const token = randomBytes(32).toString('hex');
    const tokenHash = await argon2.hash(token);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.prisma.emailVerificationToken.create({
      data: {
        userAuthId: user.auth.id,
        tokenHash,
        expiresAt,
      },
    });

    return { message: 'Verification email sent', token };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const token = await this.prisma.emailVerificationToken.findFirst({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { userAuth: true },
    });

    if (!token) {
      throw new NotFoundException('Invalid or expired token');
    }

    const isValid = await argon2.verify(token.tokenHash, dto.token);
    if (!isValid) {
      throw new NotFoundException('Invalid token');
    }

    await this.prisma.$transaction([
      this.prisma.emailVerificationToken.update({
        where: { id: token.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.userAuth.update({
        where: { id: token.userAuthId },
        data: { isEmailVerified: true },
      }),
    ]);

    return { message: 'Email verified successfully' };
  }

  async requestPasswordReset(dto: RequestResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { username: dto.identifier },
          { phoneNumber: dto.identifier },
        ],
      },
      include: { auth: true },
    });

    if (!user || !user.auth || !user.phoneNumber) {
      throw new NotFoundException('User not found or no phone number');
    }

    await this.otpService.generateOtp(user.phoneNumber, 'password_reset');
    return { message: 'Password reset OTP sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.identifier },
          { username: dto.identifier },
          { phoneNumber: dto.identifier },
        ],
      },
      include: { auth: true },
    });

    if (!user || !user.auth || !user.phoneNumber) {
      throw new NotFoundException('User not found or no phone number');
    }

    const isValid = await this.otpService.validateOtp(user.phoneNumber, dto.code, 'password_reset');
    if (!isValid) {
      throw new NotFoundException('Invalid or expired OTP');
    }

    const { hash, salt } = await this.hashPassword(dto.newPassword);

    await this.prisma.userAuth.update({
      where: { id: user.auth.id },
      data: { passwordHash: hash, passwordSalt: salt },
    });

    return { message: 'Password reset successfully' };
  }

  private async findExistingField(email: string, username: string, phoneNumber: string) {
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { username: { equals: username } },
          { phoneNumber: { equals: phoneNumber } },
        ],
      },
      select: { email: true, username: true, phoneNumber: true },
    });

    if (!existing) return null;
    if (existing.email.toLowerCase() === email.toLowerCase()) {
      return 'email';
    }
    if (existing.username === username) {
      return 'username';
    }
    return 'phoneNumber';
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = await argon2.hash(password + salt);
    return { hash, salt };
  }
}
