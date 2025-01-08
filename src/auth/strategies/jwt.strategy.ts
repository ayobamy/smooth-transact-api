import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Payload } from '../auth.type';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('access_secret'),
      expiresIn: configService.get<string>('access_expiresIn'),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: Payload) {
    const token = req?.get('authorization')?.split(' ')[1];
    if (token === null) {
      throw new UnauthorizedException('Token revoked, login again');
    }

    const user = await this.usersService.findOne(payload?.sub);

    if (!user) {
      throw new UnauthorizedException();
    }

    user.refreshToken = undefined;

    return { user };
  }
}
