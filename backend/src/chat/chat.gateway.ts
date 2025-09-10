import { UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { UnifiedAuthAndPolicyGuard } from 'src/auth/guards/unified-auth-and-policy.guard';
import { Roles } from 'src/common/enums/role';
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
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
    // @TokenPayLoadParam() payload: PayloadDto, // Comentado temporariamente
  ) {
    // Payload fake para teste
    const payload: PayloadDto = {
      sub: '60b8d295f1e5c4e9a8b9c8d5',
      email: 'test@test.com',
      roles: [Roles.USER],
      iat: Date.now(),
      exp: Date.now() + 3600000,
      aud: 'test',
      iss: 'test',
    };

    await this.roomService.enterTheRoom(roomId, payload);
    client.join(roomId);
    const users = await this.roomService.getUsersInRoom(roomId);
    this.server.to(roomId).emit('usersInRoom', users);
    client.emit('joinedRoom', { roomId });
  } // Usuário sai da sala
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
    // @TokenPayLoadParam() payload: PayloadDto, // Comentado temporariamente
  ) {
    const payload: PayloadDto = {
      sub: '60b8d295f1e5c4e9a8b9c8d5',
      email: 'test@test.com',
      roles: [Roles.USER],
      iat: Date.now(),
      exp: Date.now() + 3600000,
      aud: 'test',
      iss: 'test',
    };

    await this.roomService.leaveTheRoom(roomId, payload);
    client.leave(roomId);
    this.server.emit('messageSent', `User ${payload.email} has left the room.`);
    const users = await this.roomService.getUsersInRoom(roomId);
    this.server.to(roomId).emit('usersInRoom', users); // broadcast para todos na sala
    client.emit('leftRoom', { roomId });
  }

  // Envio de mensagem
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
    // @TokenPayLoadParam() payload: PayloadDto, // Comentado temporariamente
  ) {
    const payload: PayloadDto = {
      sub: '60b8d295f1e5c4e9a8b9c8d5',
      email: 'test@test.com',
      roles: [Roles.USER],
      iat: Date.now(),
      exp: Date.now() + 3600000,
      aud: 'test',
      iss: 'test',
    };

    console.log('Recebendo mensagem:', createMessageDto);
    console.log('Payload do usuário:', payload);

    const savedMessage = await this.messageService.create(
      createMessageDto,
      payload,
    );

    console.log('Mensagem salva:', savedMessage);
    console.log('Emitindo para sala:', createMessageDto.room);

    this.server.to(createMessageDto.room).emit('newMessage', savedMessage);
  }

  @SubscribeMessage('usersInRoom')
  async handleListUsersInRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const users = await this.roomService.getUsersInRoom(roomId);
    client.emit('usersInRoom', users);
  }

  @SubscribeMessage('getMessages')
  async handleGetMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    const messages = await this.roomService.getMessagesForRoom(roomId);
    client.emit('messagesInRoom', messages);
  }
}
