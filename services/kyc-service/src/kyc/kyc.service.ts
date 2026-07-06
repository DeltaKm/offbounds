import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IdentyfyService } from './identyfy.service';
import { KycVerification } from '@prisma/client';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identyfy: IdentyfyService,
  ) {}

  async startVerification(userId: string): Promise<{ url: string; sessionId: string }> {
    const existing = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });

    if (existing && existing.status === 'approved') {
      throw new Error('User already verified');
    }

    const session = await this.identyfy.createSession(userId);

    if (existing) {
      await this.prisma.kycVerification.update({
        where: { userId },
        data: {
          identyfySessionId: session.sessionId,
          identyfyToken: session.token,
          status: 'pending',
        },
      });
    } else {
      await this.prisma.kycVerification.create({
        data: {
          userId,
          identyfySessionId: session.sessionId,
          identyfyToken: session.token,
          status: 'pending',
        },
      });
    }

    return {
      url: session.url,
      sessionId: session.sessionId,
    };
  }

  async getVerificationStatus(userId: string): Promise<KycVerification> {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }
    return verification;
  }

  async syncStatus(sessionId: string): Promise<void> {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { identyfySessionId: sessionId },
    });
    if (!verification) {
      throw new NotFoundException('Verification not found');
    }

    const status = await this.identyfy.getSessionStatus(sessionId);

    const updateData: Record<string, unknown> = {
      status: status.status,
      isAdult: status.isAdult,
      firstName: status.firstName,
      lastName: status.lastName,
      dateOfBirth: status.dateOfBirth ? new Date(status.dateOfBirth) : undefined,
      documentType: status.documentType,
      documentNumber: status.documentNumber,
      country: status.country,
      failedReason: status.failedReason,
    };

    if (status.status === 'approved' || status.status === 'declined') {
      updateData.completedAt = new Date();
    }

    await this.prisma.kycVerification.update({
      where: { identyfySessionId: sessionId },
      data: updateData as never,
    });
  }

  async isAdultVerified(userId: string): Promise<boolean> {
    const verification = await this.prisma.kycVerification.findUnique({
      where: { userId },
    });
    if (!verification || verification.status !== 'approved') {
      return false;
    }
    return verification.isAdult === true;
  }

  async handleWebhook(payload: unknown): Promise<void> {
    const data = this.identyfy.parseWebhookPayload(payload);
    await this.syncStatus(data.sessionId);
  }
}
