import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
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
import { EmailVerificationTokenService } from '../tokens/email-verification-token.service';
import { PasswordResetTokenService } from '../tokens/password-reset-token.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

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
    private readonly emailVerificationTokenService: EmailVerificationTokenService,
    private readonly passwordResetTokenService: PasswordResetTokenService,
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

  async requestEmailVerification(userId: string) {
    const auth = await this.usersService.findAuthByUserId(userId);
    if (!auth) {
      throw new NotFoundException('Utente non trovato');
    }
    const { token, record } = await this.emailVerificationTokenService.issue(auth.id);
    return { token, expiresAt: record.expiresAt };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const record = await this.emailVerificationTokenService.validate(dto.token);
    if (!record) {
      throw new BadRequestException('Token non valido o scaduto');
    }
    await this.emailVerificationTokenService.markUsed(record.id);
    await this.usersService.markEmailVerified(record.userAuthId);
    return { success: true };
  }

  async requestPasswordReset(dto: RequestResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.auth) {
      return { token: null };
    }
    const { token, record } = await this.passwordResetTokenService.issue(user.auth.id);
    return { token, expiresAt: record.expiresAt };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const record = await this.passwordResetTokenService.validate(dto.token);
    if (!record) {
      throw new BadRequestException('Token non valido o scaduto');
    }

    const { hash, salt } = await this.hashPassword(dto.newPassword);
    await this.usersService.updatePassword(record.userAuthId, { passwordHash: hash, passwordSalt: salt });
    await this.passwordResetTokenService.markUsed(record.id);
    await this.refreshTokenService.revokeAll(record.userAuthId);

    return { success: true };
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
