import { PartialType } from '@nestjs/mapped-types';
import { CreateAuthGoogleDto } from './create-auth-google.dto';

export class UpdateAuthGoogleDto extends PartialType(CreateAuthGoogleDto) {}
