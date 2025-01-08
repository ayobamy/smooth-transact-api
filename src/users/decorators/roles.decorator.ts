// decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';
import { ROLES } from '../types/user.types';

export const Roles = (...roles: (keyof typeof ROLES)[]) => SetMetadata('roles', roles);
