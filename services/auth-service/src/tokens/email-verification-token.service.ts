import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../config';
import { addSeconds } from 'date-fns';
import { createHash, randomBytes } from 'crypto';

@Injectable()
export class EmailVerificationTokenService {
  constructor(private readonly prisma: PrismaService, private readonly config: ConfigService) {}

  async issue(userAuthId: string) {
    const token = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(token);
    const expiresAt = addSeconds(new Date(), this.config.emailVerificationTokenTtlSeconds);

    const record = await this.prisma.emailVerificationToken.create({
      data: {
        userAuthId,
        tokenHash,
        expiresAt,
      },
    });

    return { token, record };
  }

  async markUsed(id: string) {
    return this.prisma.emailVerificationToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }

  async validate(token: string, userAuthId?: string) {
    const tokenHash = this.hashToken(token);
    return this.prisma.emailVerificationToken.findFirst({
      where: {
        tokenHash,
        usedAt: null,
        expiresAt: { gt: new Date() },
        ...(userAuthId ? { userAuthId } : {}),
      },
      include: {
        userAuth: {
          include: { user: true },
        },
      },
    });
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
