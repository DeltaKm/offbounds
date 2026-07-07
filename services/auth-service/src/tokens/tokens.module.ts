import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RefreshTokenService } from './refresh-token.service';
import { AppConfigModule } from '../config';

@Module({
  imports: [PrismaModule, AppConfigModule],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
})
export class TokensModule {}
