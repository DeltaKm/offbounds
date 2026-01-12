import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { RegistrationModule } from './registration/registration.module';

@Module({
  imports: [ConfigModule, PrismaModule, RegistrationModule],
  controllers: [HealthController],
})
export class AppModule {}
