import {
  Controller,
  Get,
  Post,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
// import { RolesGuard } from './guards/roles.guard';
// import { ROLES } from './types/user.types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(): Promise<User> {
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message:
          "This endpoint does not exist. Please use '/auth/signup' to create a new user.",
      },
      HttpStatus.NOT_FOUND,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  findAll(): Promise<User[]> {
    throw new HttpException(
      {
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        message: 'This endpoint does not exist',
      },
      HttpStatus.NOT_FOUND,
    );
  }

  @Get('/stats')
  stats(): Promise<{ NumberOfUsers: number }> {
    return this.usersService.stats();
  }

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: Request): Promise<User> {
    return req.user as User;
  }
}
