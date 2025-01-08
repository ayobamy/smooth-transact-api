// transaction.dto.ts
import { IsUUID, IsNumber, IsString } from 'class-validator';
// import { Transaction } from '../entities/transactions.entity';

export class CreateTransactionDto {
  @IsUUID()
  invoiceId: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;
}
