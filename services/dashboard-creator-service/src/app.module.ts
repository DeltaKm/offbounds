import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { DashboardCreatorModule } from './dashboard-creator/dashboard-creator.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, DashboardCreatorModule],
  controllers: [HealthController],
})
export class AppModule {}
