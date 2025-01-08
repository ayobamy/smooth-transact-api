import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { PaystackService } from 'src/paystack/paystack.service';
import { Account } from './entities/account.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Account]), ConfigModule.forRoot()],
  providers: [AccountsService, PaystackService],
  controllers: [AccountsController],
  exports: [AccountsService],
})
export class AccountsModule {}
