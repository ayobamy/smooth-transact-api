import { Controller, Get, Req, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WalletService } from './wallet.service';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @UseGuards(JwtAuthGuard)
  @Get('balance')
  async getBalance(@Req() req: Request): Promise<number> {
    const userId = (req.user as any).user.id;
    const balance = await this.walletService.getWalletBalance(userId);
    return balance;
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getDetails(@Req() req: Request): Promise<any> {
    const userId = (req.user as any).user.id;
    const wallet = await this.walletService.getWalletDetails(userId);
    return wallet;
  }
}
