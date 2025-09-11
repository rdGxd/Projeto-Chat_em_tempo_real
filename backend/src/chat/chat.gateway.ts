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
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';
import { MessageService } from 'src/message/message.service';
import { RoomService } from 'src/room/room.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
@UseGuards(UnifiedAuthAndPolicyGuard) // Temporariamente desabilitado para teste multi-usuário
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly roomService: RoomService,
  ) {}

  handleConnection(client: Socket) {
    console.log(
      `🟢 User connected: ${client.id} ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'long' }).format(new Date())}`,
    );
  }
  handleDisconnect(client: Socket) {
    console.log(
      `🔴 User disconnected: ${client.id} ${new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'long' }).format(new Date())}`,
    );
  }
  // Usuário entra em uma sala
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
    @TokenPayLoadParam() payload: PayloadDto, // Comentado temporariamente
  ) {
    console.log(`🏠 User ${client.id} joining room ${roomId}`);

    // Tentar entrar na sala, mas não falhar se der erro
    try {
      await this.roomService.enterTheRoom(roomId, payload);
    } catch (error) {
      console.log(
        `⚠️ Error entering room (continuing anyway): ${error.message}`,
      );
    }

    client.join(roomId);
    console.log(`✅ User ${client.id} successfully joined room ${roomId}`);

    // Atualizar lista de usuários para todos na sala
    const users = await this.roomService.getUsersInRoom(roomId);
    this.server.to(roomId).emit('usersInRoom', users);
    client.emit('joinedRoom', { roomId });

    console.log(
      `📢 Broadcasting users list to room ${roomId}:`,
      users.length,
      'users',
    );
  } // Usuário sai da sala
  @SubscribeMessage('leaveRoom')
  async handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
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
    @TokenPayLoadParam() payload: PayloadDto, // Comentado temporariamente
  ) {
    console.log(`💬 Recebendo mensagem de ${client.id}:`, createMessageDto);
    console.log(`👤 Payload do usuário:`, payload.email);

    try {
      const savedMessage = await this.messageService.create(
        createMessageDto,
        payload,
      );

      console.log(`✅ Mensagem salva:`, savedMessage);

      // Contar quantos clientes estão na sala
      const roomClients = await this.server
        .in(createMessageDto.room)
        .fetchSockets();
      console.log(
        `📢 Emitindo mensagem para ${roomClients.length} clientes na sala ${createMessageDto.room}`,
      );

      // Emitir para TODOS os clientes na sala (incluindo o remetente)
      this.server.to(createMessageDto.room).emit('newMessage', savedMessage);

      console.log(`📤 Mensagem enviada para sala ${createMessageDto.room}`);
    } catch (error) {
      console.error(`❌ Erro ao enviar mensagem:`, error);
    }
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
