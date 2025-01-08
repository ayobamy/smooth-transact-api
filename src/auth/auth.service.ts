import * as cookie from 'cookie';
import * as bcrypt from 'bcrypt';
import { totp } from 'otplib';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { CreateUserDto } from '../users/dto/create-user-business.dto';
import { UsersService } from '../users/users.service';
import { MailgunService } from '../mailgun/mailgun.service';
import { Payload } from './auth.type';
import { User } from '../users/entities/user.entity';
import { TYPES } from 'src/users/types/user.types';
import {
  CreateBusinessUserDto,
  CreatePersonalUserDto,
} from 'src/users/dto/create-user.dto';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class AuthService {
  totp: typeof totp;
  constructor(
    private usersService: UsersService,
    private mailgunService: MailgunService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private walletService: WalletService,
  ) {
    this.totp = totp;
    this.totp.options = { digits: 6, step: 300 };
  }

  async signupForPersonal(user: CreateUserDto) {
    const personalUser = user as CreatePersonalUserDto;
    const userExists = await this.usersService.findByEmail(personalUser.email);

    if (userExists) {
      throw new ConflictException('User already exists');
    }

    personalUser.password = await this.hashPassword(personalUser.password);
    const newUser = await this.usersService.create({
      ...personalUser,
      types: TYPES.PERSONAL,
    });

    await this.mailgunService.sendWelcomeEmail(
      newUser.email,
      newUser.fullName || '',
    );

    return newUser;
  }

  async signupForBusiness(user: CreateUserDto) {
    const businessUser = user as CreateBusinessUserDto;
    const userExists = await this.usersService.findByEmail(businessUser.email);

    if (userExists) {
      throw new ConflictException('Business already exists');
    }

    businessUser.password = await this.hashPassword(businessUser.password);
    const newUser = await this.usersService.create({
      ...businessUser,
      types: TYPES.BUSINESS,
    });

    await this.mailgunService.sendWelcomeEmail(
      newUser.email,
      newUser.fullName || '',
    );

    return newUser;
  }

  async signin(user: Partial<User>) {
    const [accessToken, refreshToken] = await this.getTokens(user);
    const cookieSerialized = this.setCookies(accessToken);
    await this.setCurrentRefreshToken(refreshToken, user.id);

    const wallet = await this.walletService.getWalletDetails(user.id);

    return {
      accessToken: accessToken,
      refreshToken: refreshToken,
      cookie: cookieSerialized,
      wallet: wallet,
    };
  }

  async signout(reqUser: Partial<User>, token: string): Promise<boolean> {
    try {
      const { user } = JSON.parse(JSON.stringify(reqUser));
      if (!user || !token) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = { refreshToken: null };
      await this.usersService.update(user.id, updatedUser);
      return true;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  public async forgotPassword(email: string): Promise<{ otp: string }> {
    await this.validateEmail(email);
    const user = await this.usersService.findByEmail(email.toLowerCase());

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const otp = await this.generateResetPasswordOtp();
    await this.mailgunService.sendPasswordResetEmail(
      user.email,
      user.fullName,
      otp,
    );

    return { otp };
  }

  public async resetPassword(email: string, otp: string, newPassword: string) {
    await this.validateEmail(email);

    const user = await this.usersService.findByEmail(email.toLowerCase());
    await this.verifyResetPasswordOtp(otp, user.id);

    const updatedUser = { password: await this.hashPassword(newPassword) };

    otp = null;
    return await this.usersService.update(user.id, updatedUser);
  }

  private async hashPassword(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password is required for hashing.');
    }
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  private async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  public async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (user && (await this.comparePassword(password, user.password))) {
      user.password = undefined;
      return user;
    }

    return null;
  }

  public async createAccessTokenFromRefreshToken(refreshToken: string) {
    try {
      const decoded = this.jwtService.decode(refreshToken) as Payload;
      if (!decoded) {
        throw new NotFoundException('Invalid token');
      }

      const user = await this.usersService.findOne(decoded.sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isRefreshTokenMatched = await bcrypt.compare(
        refreshToken,
        user.refreshToken,
      );
      if (!isRefreshTokenMatched) {
        throw new NotFoundException('Invalid token');
      }

      const [accessToken] = await this.getTokens(user);

      return { accessToken };
    } catch (error) {
      throw new NotFoundException('Invalid token');
    }
  }

  getTokenOption(type: string): JwtSignOptions {
    const options: JwtSignOptions = {
      secret: this.configService.get(`${type}_secret`),
      expiresIn: this.configService.get(`${type}_expiresIn`),
    };

    return options;
  }

  async getTokens(user: Partial<User>) {
    const payload: Payload = { sub: user.id, role: user.role };

    const [accessToken, refreshToken] = await Promise.all([
      await this.jwtService.signAsync(payload, this.getTokenOption('access')),
      await this.jwtService.signAsync(payload, this.getTokenOption('refresh')),
    ]);

    return [accessToken, refreshToken];
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    const updatedUser = { refreshToken: hashedRefreshToken };
    await this.usersService.update(userId, updatedUser);
  }

  public async generateResetPasswordOtp(): Promise<string> {
    return this.totp.generate(this.configService.get('otp_secret'));
  }

  private setCookies(token: string): string {
    return cookie.serialize('Bearer', token, {
      httpOnly: true,
      secure: this.configService.get('env') === 'production',
      sameSite: true,
      maxAge: 3600,
      path: '/',
    });
  }

  public async verifyResetPasswordOtp(
    otp: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _userId: string,
  ): Promise<boolean> {
    const OTP_TOKEN_SECRET = this.configService.get('otp_secret');
    const isValid = this.totp.check(otp, OTP_TOKEN_SECRET);

    if (!isValid) {
      throw new NotFoundException('Invalid OTP or OTP has expired');
    }

    return true;
  }

  private async validateEmail(email: string) {
    const emailRegex = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';
    if (!email.match(emailRegex)) {
      throw new NotFoundException('Invalid email');
    }
  }
}
