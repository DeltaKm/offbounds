import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { TokenPayload } from '@offbounds/shared-types';
import * as argon2 from 'argon2';
import { randomBytes } from 'crypto';
import type Redis from 'ioredis';

import { ConfigService, REDIS_CLIENT } from '../config';
import { UsersService } from '../users/users.service';
import { RefreshTokenService } from '../tokens/refresh-token.service';
import { OtpService } from '@offbounds/otp-service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { SendLoginOtpDto } from './dto/send-login-otp.dto';
import { VerifyLoginOtpDto } from './dto/verify-login-otp.dto';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresAt: Date;
  user: {
    id: string;
    email: string;
    username: string;
    isEmailVerified: boolean;
  };
}

@Injectable()
export class AuthService {
  private readonly loginAttemptsWindow = 10 * 60; // 10 minuti
  private readonly loginAttemptsLimit = 5;

  constructor(
    private readonly usersService: UsersService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly otpService: OtpService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  async login(dto: LoginDto, req: Request): Promise<AuthResult> {
    const ip = this.getRequestIp(req);
    await this.enforceRateLimit(ip);

    const user = await this.resolveUser(dto.identifier);
    if (!user || !user.auth) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    const passwordValid = await this.verifyPassword(dto.password, user.auth.passwordHash, user.auth.passwordSalt);
    if (!passwordValid) {
      throw new UnauthorizedException('Credenziali non valide');
    }

    await this.clearRateLimit(ip);

    const { token: refreshToken, record } = await this.refreshTokenService.generate(
      user.auth.id,
      this.extractRequestMetadata(req),
    );
    const accessToken = this.createAccessToken(user.id, user.email, user.username);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      refreshTokenExpiresAt: record.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.auth.isEmailVerified,
      },
    };
  }

  async refresh(dto: RefreshTokenDto, req: Request): Promise<AuthResult> {
    const record = await this.refreshTokenService.validate(dto.refreshToken);
    if (!record) {
      throw new UnauthorizedException('Refresh token non valido');
    }

    await this.refreshTokenService.revokeById(record.id);

    const { token: newRefreshToken, record: newRecord } = await this.refreshTokenService.generate(
      record.userAuthId,
      this.extractRequestMetadata(req),
    );
    const payloadUser = record.userAuth.user;
    const accessToken = this.createAccessToken(payloadUser.id, payloadUser.email, payloadUser.username);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      refreshTokenExpiresAt: newRecord.expiresAt,
      user: {
        id: payloadUser.id,
        email: payloadUser.email,
        username: payloadUser.username,
        isEmailVerified: record.userAuth.isEmailVerified,
      },
    };
  }

  async logout(dto: RefreshTokenDto): Promise<void> {
    const record = await this.refreshTokenService.validate(dto.refreshToken);
    if (!record) {
      return;
    }
    await this.refreshTokenService.revokeById(record.id);
  }

  async me(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException();
    }
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isEmailVerified: user.auth?.isEmailVerified ?? false,
    };
  }

  async sendLoginOtp(dto: SendLoginOtpDto) {
    const user = await this.resolveUser(dto.identifier);
    if (!user || !user.phoneNumber) {
      throw new UnauthorizedException('User not found or no phone number');
    }
    await this.otpService.generateOtp(user.phoneNumber, 'login');
    return { message: 'OTP sent' };
  }

  async verifyLoginOtp(dto: VerifyLoginOtpDto, req: Request): Promise<AuthResult> {
    const user = await this.resolveUser(dto.identifier);
    if (!user || !user.phoneNumber) {
      throw new UnauthorizedException('User not found or no phone number');
    }

    const isValid = await this.otpService.validateOtp(user.phoneNumber, dto.code, 'login');
    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.auth) {
      throw new UnauthorizedException('User auth not found');
    }

    const { token: refreshToken, record } = await this.refreshTokenService.generate(
      user.auth.id,
      this.extractRequestMetadata(req),
    );
    const accessToken = this.createAccessToken(user.id, user.email, user.username);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenTtlSeconds,
      refreshTokenExpiresAt: record.expiresAt,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.auth.isEmailVerified,
      },
    };
  }

  private createAccessToken(userId: string, email: string, username: string) {
    const payload: TokenPayload = {
      sub: userId,
      email,
      username,
    };
    return this.jwtService.sign(payload);
  }

  private async hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = await argon2.hash(password + salt);
    return { hash, salt };
  }

  private async verifyPassword(password: string, hash: string, salt: string) {
    return argon2.verify(hash, password + salt);
  }

  private getRequestIp(req: Request) {
    return (req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown') as string;
  }

  private extractRequestMetadata(req: Request) {
    return {
      userAgent: req.headers['user-agent'] ?? 'unknown',
      ipAddress: this.getRequestIp(req),
    };
  }

  private async enforceRateLimit(ip: string) {
    const key = `auth:login:ip:${ip}`;
    try {
      const attempts = await this.redis.incr(key);
      if (attempts === 1) {
        await this.redis.expire(key, this.loginAttemptsWindow);
      }
      if (attempts > this.loginAttemptsLimit) {
        throw new HttpException('Troppi tentativi di login. Riprova più tardi.', HttpStatus.TOO_MANY_REQUESTS);
      }
    } catch (error) {
      // Redis failure should not block login; log and continue without rate limiting
      console.error('Redis rate limit error:', (error as Error).message);
    }
  }

  private async clearRateLimit(ip: string) {
    const key = `auth:login:ip:${ip}`;
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Redis clear rate limit error:', (error as Error).message);
    }
  }

  private async resolveUser(identifier: string) {
    const isEmail = /@/.test(identifier);
    return isEmail ? this.usersService.findByEmail(identifier) : this.usersService.findByUsername(identifier);
  }
}
