import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [ConfigModule, PrismaModule, OtpModule],
})
export class AppModule {}
