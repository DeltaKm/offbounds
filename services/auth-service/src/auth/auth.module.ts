import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { TokensModule } from '../tokens/tokens.module';
import { AppConfigModule, ConfigService } from '../config';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { OtpModule } from '@offbounds/otp-service';

@Module({
  imports: [
    AppConfigModule,
    UsersModule,
    TokensModule,
    OtpModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.jwtAccessSecret,
        signOptions: {
          expiresIn: config.accessTokenTtlSeconds,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessStrategy],
})
export class AuthModule {}
