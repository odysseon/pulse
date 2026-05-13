import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { RoleType } from '../../users/core/domain/user.types.js';
import type { RequestIdentity } from '@odysseon/whoami-adapter-nestjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are required, let it pass
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest<{
      whoami?: { identity: RequestIdentity };
    }>();

    const accountId = request.whoami?.identity?.accountId;

    if (!accountId) {
      throw new ForbiddenException('Authentication required to verify roles');
    }

    //  Database lookup
    const user = await this.prisma.user.findUnique({
      where: { accountId },
      select: { role: true },
    });

    if (!user) throw new ForbiddenException('User profile not found');

    // Deterministic Intersection: Does the user have ANY of the required roles?
    const hasPermission = user.role.some((role) => requiredRoles.includes(role));

    if (!hasPermission) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
