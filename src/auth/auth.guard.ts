import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = this.configService.get<string>('TOKEN'); // อ่านจาก .env

    if (authHeader && authHeader === `Bearer ${token}`) {
      return true;
    }
    throw new UnauthorizedException('Invalid or missing token');
  }
}
