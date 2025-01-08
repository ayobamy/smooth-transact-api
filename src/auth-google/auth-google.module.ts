import { Module } from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';
import { AuthGoogleController } from './auth-google.controller';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [],
  controllers: [AuthGoogleController],
  providers: [AuthGoogleService, GoogleStrategy],
})
export class AuthGoogleModule {}
