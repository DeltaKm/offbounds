import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, SettingModule],
  controllers: [HealthController],
})
export class AppModule {}
