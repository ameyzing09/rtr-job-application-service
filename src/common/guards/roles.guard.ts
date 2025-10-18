import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';

interface UserWithRole {
  role?: string;
  roles?: string[];
  [key: string]: unknown;
}

interface RequestWithUser extends Request {
  user?: UserWithRole;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true; // No roles required, allow access
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      return false; // No user in request, deny access
    }

    // Check if user has role (single) or roles (array)
    const userRoles: string[] = [];
    if (user.role) {
      userRoles.push(user.role);
    }
    if (user.roles && Array.isArray(user.roles)) {
      userRoles.push(...user.roles);
    }

    // Check if user has any of the required roles
    return requiredRoles.some((role) => userRoles.includes(role));
  }
}
