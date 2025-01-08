import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AccountsService } from './accounts.service';

@Controller('accounts')
@UseGuards(JwtAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  async addAccount(
    @Body() body: { accountNumber: string; bankName: string },
    @Req() req: Request,
  ): Promise<any> {
    const userId = (req.user as any).user.id;
    const account = await this.accountsService.resolveAndSaveAccountDetails(
      userId,
      body.accountNumber,
      body.bankName,
    );

    return {
      message: 'Account added successfully',
      data: account,
    };
  }

  @Get()
  async getAccountDetails(@Req() req: Request): Promise<any> {
    const userId = (req.user as any).user.id;
    const accountDetails =
      await this.accountsService.getUserAccountDetails(userId);

    return {
      accountDetails,
    };
  }
}
