import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { addSeconds } from 'date-fns';
import { ConfigService } from '../config';
import { createHash, randomBytes } from 'crypto';
import type { Prisma } from '@prisma/client';

@Injectable()
export class RefreshTokenService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  private readonly tokenInclude = {
    userAuth: {
      include: { user: true },
    },
  } satisfies Prisma.RefreshTokenInclude;

  async generate(userAuthId: string, metadata: { userAgent?: string; ipAddress?: string }) {
    const token = randomBytes(48).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = addSeconds(new Date(), this.config.refreshTokenTtlSeconds);
    const record = await this.prisma.refreshToken.create({
      data: {
        userAuthId,
        tokenHash,
        userAgent: metadata.userAgent,
        ipAddress: metadata.ipAddress,
        expiresAt,
      },
      include: this.tokenInclude,
    });

    return { token, record };
  }

  async revokeById(id: string) {
    return this.prisma.refreshToken.update({ where: { id }, data: { isRevoked: true } });
  }

  async revokeAll(userAuthId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userAuthId }, data: { isRevoked: true } });
  }

  async validate(token: string, userAuthId?: string) {
    const tokenHash = this.hashToken(token);
    const record = await this.prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: { gt: new Date() },
        ...(userAuthId ? { userAuthId } : {}),
      },
      include: this.tokenInclude,
    });
    return record;
  }

  hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

}
