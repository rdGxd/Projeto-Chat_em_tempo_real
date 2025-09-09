import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { UnifiedAuthAndPolicyGuard } from 'src/auth/guards/unified-auth-and-policy.guard';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(UnifiedAuthAndPolicyGuard)
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
  ) {}

  handleConnection(client: Socket) {
    console.log(
      `User connected: ${client.id} ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'long' }).format(new Date())}`,
    );
  }

  handleDisconnect(client: Socket) {
    console.log(
      `User disconnected: ${client.id} ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'long' }).format(new Date())}`,
    );
  }

  // Usuário entra em uma sala
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    roomId: string,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    await this.roomService.enterTheRoom(roomId, payload);
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);

    client.emit('joinedRoom', { roomId });
  }

  // Usuário sai da sala
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(client: Socket, roomId: string, @TokenPayLoadParam() payload: PayloadDto) {
    await this.roomService.leaveTheRoom(roomId, payload);
    client.leave(roomId);
    console.log(`Client ${client.id} left room ${roomId}`);

    client.emit('leftRoom', { roomId });
  }

  // Envio de mensagem
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    client: Socket,
    payload: { createMessageDto: CreateMessageDto; user: PayloadDto },
  ) {
    const { createMessageDto, user } = payload;

    const savedMessage = await this.messageService.create(
      createMessageDto,
      user,
    );

    // Confirmação só para quem enviou
    client.emit('messageSent', savedMessage);

    // Broadcast para os outros na sala (não inclui o remetente)
    client.broadcast.to(createMessageDto.room).emit('newMessage', savedMessage);
  }

  @SubscribeMessage('usersInRoom')
  async handleListUsersInRoom(client: Socket, roomId: string) {
    const users = await this.roomService.getUsersInRoom(roomId);

    // Envia a lista de usuários na sala para o cliente
    client.emit('usersInRoom', users);

    // Se quiser broadcast para todos na sala, use:
    // this.server.to(roomId).emit('usersInRoom', users);
  }
}
