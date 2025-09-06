import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../constants/public.constants';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

@Injectable()
export class AuthAndPolicyGuard implements CanActivate {
  constructor(
    private readonly authTokenGuard: AuthGuard,
    private readonly routePolicyGuard: RolesGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isAuthValid = await this.authTokenGuard.canActivate(context);
    if (!isAuthValid) return false;

    return this.routePolicyGuard.canActivate(context);
  }
}
