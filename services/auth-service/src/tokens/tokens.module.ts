import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenService } from './refresh-token.service';
import { EmailVerificationTokenService } from './email-verification-token.service';
import { PasswordResetTokenService } from './password-reset-token.service';
import { AppConfigModule } from '../config';

@Module({
  imports: [PrismaModule, AppConfigModule],
  providers: [RefreshTokenService, EmailVerificationTokenService, PasswordResetTokenService],
  exports: [RefreshTokenService, EmailVerificationTokenService, PasswordResetTokenService],
})
export class TokensModule {}
