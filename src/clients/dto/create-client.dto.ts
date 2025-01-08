import { IsNotEmpty, IsEmail, IsPhoneNumber } from 'class-validator';

export class CreateClientProfileDto {
  @IsNotEmpty()
  fullName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsPhoneNumber()
  phone: string;
}
