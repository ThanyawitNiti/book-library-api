import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from '../auth-service/auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: { username: string; password: string }) {
    // hardcode login for demo
    if (body.username === 'demo' && body.password === 'a123456#') {
      return { token: 'TEST-TOKEN' };
    }
    return { error: 'Invalid credentials' };
  }
}
