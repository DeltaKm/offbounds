import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '../config/config.service';

interface IdentyfySessionResponse {
  sessionId: string;
  token: string;
  url: string;
}

interface IdentyfyWebhookPayload {
  sessionId: string;
  status: 'approved' | 'declined' | 'pending';
  isAdult?: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  documentType?: string;
  documentNumber?: string;
  country?: string;
  failedReason?: string;
}

@Injectable()
export class IdentyfyService {
  private readonly logger = new Logger(IdentyfyService.name);
  private readonly apiUrl = 'https://api.identyfy.com/v1';

  constructor(private readonly config: ConfigService) {}

  async createSession(userId: string): Promise<IdentyfySessionResponse> {
    const apiKey = this.config.identyfyApiKey;
    if (!apiKey) {
      throw new Error('IDENYFY_API_KEY not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          externalId: userId,
          verificationType: 'standard',
          requireAgeVerification: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Identyfy API error: ${response.statusText}`);
      }

      const data = await response.json() as { sessionId: string; token: string; url: string };
      return {
        sessionId: data.sessionId,
        token: data.token,
        url: data.url,
      };
    } catch (error) {
      this.logger.error('Failed to create Identyfy session', error);
      throw error;
    }
  }

  async getSessionStatus(sessionId: string): Promise<IdentyfyWebhookPayload> {
    const apiKey = this.config.identyfyApiKey;
    if (!apiKey) {
      throw new Error('IDENYFY_API_KEY not configured');
    }

    try {
      const response = await fetch(`${this.apiUrl}/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Identyfy API error: ${response.statusText}`);
      }

      return await response.json() as never;
    } catch (error) {
      this.logger.error('Failed to get session status', error);
      throw error;
    }
  }

  parseWebhookPayload(payload: unknown): IdentyfyWebhookPayload {
    return payload as never;
  }
}
