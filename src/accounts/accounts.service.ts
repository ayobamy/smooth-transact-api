// accounts/accounts.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from './entities/account.entity';
import { PaystackService } from '../paystack/paystack.service';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private paystackService: PaystackService,
  ) {}

  async resolveAndSaveAccountDetails(
    userId: string,
    accountNumber: string,
    bankName: string,
  ): Promise<Account> {
    const bankListResponse = await this.paystackService.getBankList();
    const bank = bankListResponse.data.find(
      (b: { name: string }) => b.name === bankName,
    );

    if (!bank) {
      throw new HttpException('Invalid bank name', HttpStatus.BAD_REQUEST);
    }

    const bankCode = bank.code;

    const accountDetails = await this.paystackService.resolveAccountNumber(
      accountNumber,
      bankCode,
    );

    const existingAccount = await this.accountRepository.findOne({
      where: { accountNumber, user: { id: userId } },
    });

    if (existingAccount) {
      throw new HttpException(
        'Account number already exists',
        HttpStatus.CONFLICT,
      );
    }

    const newAccount = this.accountRepository.create({
      user: { id: userId },
      accountNumber: accountDetails.account_number,
      accountName: accountDetails.account_name,
      bankCode: bankCode,
      bankName: bankName,
    });

    const savedAccount = await this.accountRepository.save(newAccount);

    return savedAccount;
  }

  async getUserAccountDetails(userId: string): Promise<Account[]> {
    return this.accountRepository.find({
      where: { user: { id: userId } },
    });
  }
}
