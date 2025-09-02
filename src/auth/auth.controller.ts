import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

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
