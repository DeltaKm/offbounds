import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './jwt-access.strategy';

@Module({
  imports: [PassportModule],
  providers: [JwtAccessStrategy],
  exports: [PassportModule],
})
export class AuthModule {}
