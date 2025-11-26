import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config';
import { addSeconds } from 'date-fns';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class PasswordResetTokenService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async issue(userAuthId: string) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = addSeconds(new Date(), this.config.passwordResetTokenTtlSeconds);

    const record = await this.prisma.passwordResetToken.create({
      data: {
        userAuthId,
        tokenHash,
        expiresAt,
      },
    });

    return { token, record };
  }

  async markUsed(id: string) {
    return this.prisma.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async validate(token: string, userAuthId?: string) {
    const tokenHash = this.hashToken(token);
    return this.prisma.passwordResetToken.findFirst({
      where: {
        ...(userAuthId ? { userAuthId } : {}),
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
