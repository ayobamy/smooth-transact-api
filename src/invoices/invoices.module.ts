import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoiceController } from './invoices.controller';
import { Invoice } from './entities/invoice.entity';
import { User } from '../users/entities/user.entity';
import { ClientProfile } from '../clients/entities/client.entity';
import { TransactionsModule } from '../transactions/transactions.module';
import { PaystackService } from 'src/paystack/paystack.service';
import { ClientsService } from 'src/clients/clients.service';
import { WalletService } from 'src/wallet/wallet.service';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { MailgunService } from 'src/mailgun/mailgun.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, User, ClientProfile, Wallet]),
    forwardRef(() => TransactionsModule),
  ],
  providers: [
    InvoicesService,
    PaystackService,
    ClientsService,
    WalletService,
    MailgunService,
  ],
  controllers: [InvoiceController],
  exports: [InvoicesService],
})
export class InvoicesModule {}
