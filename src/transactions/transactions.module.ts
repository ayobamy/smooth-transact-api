import { forwardRef, Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transactions.entity';
import { InvoicesModule } from '../invoices/invoices.module';
import { WalletService } from 'src/wallet/wallet.service';
import { UsersService } from 'src/users/users.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transaction, Wallet, User]),
    forwardRef(() => InvoicesModule),
  ],
  providers: [TransactionsService, WalletService, UsersService],
  controllers: [TransactionsController],
  exports: [TransactionsService],
})
export class TransactionsModule {}
