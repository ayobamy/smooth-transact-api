import {
  IsNumber,
  IsNotEmpty,
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
} from 'class-validator';

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  amount: number;

  @IsString()
  @IsNotEmpty()
  clientId: string;

  @IsNotEmpty()
  @IsEnum(['paid', 'pending', 'due'])
  status: string;

  @IsDateString()
  @IsOptional()
  dueDate: string;

  @IsString()
  clientFullName: string;

  @IsString()
  clientEmail: string;

  @IsString()
  clientPhone: string;
}
