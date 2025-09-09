import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Socket } from 'socket.io';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../constants/auth.constants';
import { IS_PUBLIC_KEY } from '../constants/public.constants';
import { AuthAndPolicyGuard } from './auth-and-policy.guard';

@Injectable()
export class UnifiedAuthAndPolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authAndPolicyGuard: AuthAndPolicyGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<'http' | 'ws'>();

    if (type === 'ws') {
      // Para WebSocket, verifica se é público usando o contexto original
      const isPublic = this.reflector.getAllAndOverride<boolean>(
        IS_PUBLIC_KEY,
        [context.getHandler(), context.getClass()],
      );
      if (isPublic) return true;

      // Contexto WebSocket
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = client.handshake.auth.token;
      if (!token) {
        client.disconnect();
        throw new UnauthorizedException('Token not found');
      }

      // Cria um request fake com headers, para reaproveitar o AuthAndPolicyGuard
      const fakeRequest: any = {
        headers: { authorization: `Bearer ${token}` },
      };

      // Cria um contexto fake mais completo que implementa todos os métodos necessários
      const fakeContext = {
        ...context,
        getHandler: () => context.getHandler(),
        getClass: () => context.getClass(),
        switchToHttp: () => ({ getRequest: () => fakeRequest }),
        switchToRpc: () => context.switchToRpc(),
        switchToWs: () => context.switchToWs(),
        getType: () => 'http' as const, // Finge ser HTTP para o AuthAndPolicyGuard
      } as ExecutionContext;

      const isAuthValid =
        await this.authAndPolicyGuard.canActivate(fakeContext);
      if (!isAuthValid) return false;

      // Salva o payload no socket - verifica ambas as fontes possíveis
      const userPayload =
        fakeRequest[REQUEST_TOKEN_PAYLOAD_KEY] || fakeRequest.user;

      if (!userPayload) {
        client.disconnect();
        throw new UnauthorizedException('Authentication failed - no payload');
      }

      client.data.user = userPayload;
      return true;
    } else {
      // Contexto HTTP, reaproveita guard existente
      return this.authAndPolicyGuard.canActivate(context);
    }
  }
}
