import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth-service/auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    const token = this.configService.get<string>('TOKEN'); // อ่านจาก .env
    // hardcode login for demo
    if (body.username === 'demo' && body.password === 'a123456#') {
      return { token: token };
    }
    return { error: 'Invalid credentials' };
  }
}
