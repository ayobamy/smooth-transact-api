import { Response } from 'express';
import {
  Body,
  Post,
  Controller,
  Res,
  Request,
  HttpStatus,
  UseGuards,
  Get,
  HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateBusinessUserDto,
  CreatePersonalUserDto,
} from '../users/dto/create-user.dto';
import {
  RefreshTokenDto,
  SigninDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import {
  SignupResponse,
  SigninResponse,
  RefreshTokenResponse,
  ForgotPasswordResponse,
  ResetPasswordResponse,
} from './auth.type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { WalletService } from 'src/wallet/wallet.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private walletService: WalletService,
  ) {}

  @Post('/signup/personal')
  async signupForPersonal(
    @Body() user: CreatePersonalUserDto,
  ): Promise<SignupResponse> {
    const data = await this.authService.signupForPersonal(user);
    return { message: 'Signup successfully', data };
  }

  @Post('/signup/business')
  async signupForBusiness(
    @Body() user: CreateBusinessUserDto,
  ): Promise<SignupResponse> {
    const data = await this.authService.signupForBusiness(user);
    return { message: 'Signup successfully', data };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  async signin(
    @Body() body: SigninDto,
    @Request() req,
    @Res({ passthrough: true }) response: Response,
  ): Promise<SigninResponse> {
    const { accessToken, refreshToken, cookie, wallet } =
      await this.authService.signin(req.user);

    response.cookie('Authorization', cookie, {
      httpOnly: true,
      maxAge: 3600,
      secure: true,
    });

    return {
      message: 'Signin successfully',
      data: { accessToken, refreshToken, wallet },
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponse> {
    const otp = await this.authService.forgotPassword(body.email);
    return { message: 'Reset password OTP generated successfully', data: otp };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    const { email, otp, newPassword } = body;
    await this.authService.resetPassword(email, otp, newPassword);
    return {
      message: 'Reset password successfully, signin with your new password.',
    };
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @Get('/signout')
  async signout(@Request() req: any) {
    const token = req.headers?.authorization?.split(' ')[1];
    await this.authService.signout(req.user, token);
    req.res.setHeader('Authorization', null);
    return { message: 'Signout successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  async refreshToken(
    @Body() data: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    const { accessToken } =
      await this.authService.createAccessTokenFromRefreshToken(
        data.refreshToken,
      );
    return {
      message: 'New access token  successfully created',
      data: {
        accessToken,
      },
    };
  }
}
