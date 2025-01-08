import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { PaystackService } from './paystack.service';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initiate-payment')
  async initiatePayment(
    @Body() body: { email: string; amount: number },
  ): Promise<any> {
    try {
      const paymentLink = await this.paystackService.initiatePayment(
        body.email,
        body.amount,
      );
      return { paymentLink };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to initiate payment' };
    }
  }

  @Post('verify-payment')
  async verifyPayment(@Body() body: { reference: string }): Promise<any> {
    try {
      const paymentDetails = await this.paystackService.verifyPayment(
        body.reference,
      );
      return { paymentDetails };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to verify payment' };
    }
  }

  @Get('banks')
  async getBankList(): Promise<any> {
    try {
      const bankList = await this.paystackService.getBankList();
      return { bankList };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to fetch bank list' };
    }
  }

  @Post('resolve-account-number')
  async resolveAccountNumber(
    @Body() body: { accountNumber: string; bankCode: string },
  ): Promise<any> {
    try {
      const accountDetails = await this.paystackService.resolveAccountNumber(
        body.accountNumber,
        body.bankCode,
      );
      return { accountDetails };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to resolve account number' };
    }
  }

  @Get('bank-code')
  async getBankCode(@Query('bankName') bankName: string): Promise<any> {
    try {
      const bankCode = await this.paystackService.getBankCode(bankName);
      return { bankCode };
    } catch (error) {
      console.error(error);
      return { error: 'Failed to fetch bank code' };
    }
  }
}
