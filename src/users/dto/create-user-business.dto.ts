import { CreatePersonalUserDto } from './create-user.dto';
import { CreateBusinessUserDto } from './create-user.dto';

export type CreateUserDto = CreatePersonalUserDto | CreateBusinessUserDto;
