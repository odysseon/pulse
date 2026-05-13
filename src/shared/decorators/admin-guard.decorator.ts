import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../../generated/prisma/client.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';

export function AdminGuard() {
  return applyDecorators(Roles(Role.ADMIN), UseGuards(RolesGuard));
}
