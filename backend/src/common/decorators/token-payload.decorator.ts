import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { Socket } from 'socket.io';
import { REQUEST_TOKEN_PAYLOAD_KEY } from '../../auth/constants/auth.constants';

export const TokenPayLoadParam = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const type = ctx.getType<'http' | 'ws'>();

    if (type === 'ws') {
      // Contexto WebSocket
      const client: Socket = ctx.switchToWs().getClient<Socket>();
      return client.data.user;
    } else {
      // Contexto HTTP
      const request: Request = ctx.switchToHttp().getRequest();
      return request[REQUEST_TOKEN_PAYLOAD_KEY];
    }
  },
);
