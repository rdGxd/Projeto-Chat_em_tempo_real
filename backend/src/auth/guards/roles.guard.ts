import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from 'src/common/enums/role';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Roles | Roles[]>(
      'ROUTE_POLICY_KEY',
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const tokenPayload = context.switchToHttp().getRequest()[
      REQUEST_TOKEN_PAYLOAD_KEY
    ];

    if (!tokenPayload) {
      throw new UnauthorizedException('Token payload not found');
    }

    const { roles }: { roles: Roles[] } = tokenPayload,
      userRoles = roles ?? [],
      Roles = ([] as Roles[]).concat(requiredRoles);
    const hasPermission = Roles.some((p) => userRoles.includes(p));

    if (!hasPermission) {
      throw new UnauthorizedException(
        `Usuário não tem a permissão necessária: ${Roles.join(', ')}`,
      );
    }

    return true;
  }
}
