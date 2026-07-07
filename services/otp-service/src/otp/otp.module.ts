import { Module } from '@nestjs/common';
import { OtpService } from './otp.service';
import { OtpController } from './otp.controller';
import { MockSmsProvider } from './mock-sms.provider';
import { ConfigModule } from '../config/config.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [OtpController],
  providers: [
    OtpService,
    MockSmsProvider,
  ],
  exports: [OtpService],
})
export class OtpModule {}
