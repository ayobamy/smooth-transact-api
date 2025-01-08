import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { AuthService } from 'src/auth/auth.service';
import { UsersService } from 'src/users/users.service';
import { MailgunService } from 'src/mailgun/mailgun.service';
import { ClientProfile } from './entities/client.entity';
import { User } from 'src/users/entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ClientProfile, User, Wallet]),
    JwtModule.register({}),
  ],
  providers: [
    ClientsService,
    AuthService,
    UsersService,
    MailgunService,
    WalletService,
  ],
  controllers: [ClientsController],
  exports: [ClientsService],
})
export class ClientsModule {}
