import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { HealthController } from './health/health.controller';
import { SettingModule } from './setting/setting.module';

@Module({
  imports: [ConfigModule, SettingModule],
  controllers: [HealthController],
})
export class AppModule {}
