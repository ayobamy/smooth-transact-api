import { IsNumber } from 'class-validator';

export class UpdateWalletBalanceDto {
  @IsNumber()
  amount: number;
}
