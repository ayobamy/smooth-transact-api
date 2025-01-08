import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { WalletModule } from '../wallet/wallet.module';
import { User } from './entities/user.entity';
import { Wallet } from 'src/wallet/entities/wallet.entity';
import { WalletService } from 'src/wallet/wallet.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Wallet]), WalletModule],
  controllers: [UsersController],
  providers: [UsersService, WalletService],
})
export class UsersModule {}
