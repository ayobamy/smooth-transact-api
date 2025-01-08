import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('google')
export class AuthGoogleController {
  constructor(private readonly authGoogleService: AuthGoogleService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  googleAuthRedirect(@Request() req) {
    return this.authGoogleService.googleLogin(req);
  }
}
