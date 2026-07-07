import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '../config/config.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private config: ConfigService) {
    super();
  }

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: unknown, user: unknown, info: unknown, context: ExecutionContext): any {
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
