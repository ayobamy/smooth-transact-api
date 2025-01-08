import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { AuthGoogleModule } from './auth-google/auth-google.module';
import { MailgunModule } from './mailgun/mailgun.module';
import { ClientsModule } from './clients/clients.module';
import { TransactionsModule } from './transactions/transactions.module';
import { InvoicesModule } from './invoices/invoices.module';
import { PaystackModule } from './paystack/paystack.module';
import { AlertsModule } from './alerts/alerts.module';
import { NotificationServiceModule } from './notification-service/notification-service.module';
import { WalletModule } from './wallet/wallet.module';
import { AccountsModule } from './accounts/accounts.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      cache: true,
    }),
    TransactionsModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
    AuthGoogleModule,
    MailgunModule,
    ClientsModule,
    PaystackModule,
    AlertsModule,
    NotificationServiceModule,
    WalletModule,
    TransactionsModule,
    InvoicesModule,
    AccountsModule,
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
