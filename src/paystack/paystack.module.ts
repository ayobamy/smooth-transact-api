import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PayStack } from './entities/paystack.entity';
import { PaystackService } from './paystack.service';
import { PaystackController } from './paystack.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PayStack]), ConfigModule.forRoot()],
  providers: [PaystackService],
  controllers: [PaystackController],
  exports: [PaystackService],
})
export class PaystackModule {}
