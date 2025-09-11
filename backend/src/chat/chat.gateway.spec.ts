import { Server, Socket } from 'socket.io';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { Roles } from 'src/common/enums/role';
import { CreateMessageDto } from 'src/message/dto/create-message.dto';

// Gateway completamente isolado para testes
class TestChatGateway {
  server: any;

  constructor(
    private readonly messageService: any,
    private readonly roomService: any,
  ) {}

  handleConnection(client: Socket) {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`User connected: ${client.id} ${timestamp}`);
  }

  handleDisconnect(client: Socket) {
    const timestamp = new Date().toLocaleString('pt-BR');
    console.log(`User disconnected: ${client.id} ${timestamp}`);
  }

  async handleJoinRoom(client: Socket, roomId: string) {
    client.join(roomId);
    console.log(`Client ${client.id} joined room ${roomId}`);
    client.emit('joinedRoom', { roomId });
  }

  handleLeaveRoom(client: Socket, roomId: string) {
    client.leave(roomId);
    console.log(`Client ${client.id} left room ${roomId}`);
    client.emit('leftRoom', { roomId });
  }

  async handleSendMessage(
    client: Socket,
    payload: { createMessageDto: CreateMessageDto; user: PayloadDto },
  ) {
    const { createMessageDto, user } = payload;
    const savedMessage = await this.messageService.create(
      createMessageDto,
      user,
    );
    client.emit('messageSent', savedMessage);
    client.broadcast.to(createMessageDto.room).emit('newMessage', savedMessage);
  }

  async handleListUsersInRoom(client: Socket, roomId: string) {
    const users = await this.roomService.getUsersInRoom(roomId);
    client.emit('usersInRoom', users);
  }
}

// Tipos para mocks tipados
interface MockSocket {
  id: string;
  join: jest.MockedFunction<any>;
  leave: jest.MockedFunction<any>;
  emit: jest.MockedFunction<any>;
  broadcast: {
    to: jest.MockedFunction<any>;
    emit: jest.MockedFunction<any>;
  };
  handshake: any;
}

interface MockServer {
  to: jest.MockedFunction<any>;
  emit: jest.MockedFunction<any>;
}

describe('TestChatGateway - Funcionalidade Socket.IO', () => {
  let gateway: TestChatGateway;
  let mockMessageService: any;
  let mockRoomService: any;

  let mockServer: MockServer;
  let mockClient: MockSocket;

  // Dados de teste reutilizáveis
  const testRoomId = '507f1f77bcf86cd799439011';
  const testUserId = '507f1f77bcf86cd799439012';
  const testClientId = 'test-client-id-12345';

  const createMockPayload = (): PayloadDto => ({
    sub: testUserId,
    email: 'test@example.com',
    roles: [Roles.USER],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    aud: 'test-audience',
    iss: 'test-issuer',
  });

  const createMockMessage = () => ({
    id: '507f1f77bcf86cd799439013',
    content: 'Test message content',
    room: testRoomId,
    author: testUserId,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const createMockUsers = () => [
    {
      id: 'user-1',
      name: 'Test User 1',
      email: 'user1@test.com',
    },
    {
      id: 'user-2',
      name: 'Test User 2',
      email: 'user2@test.com',
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock services
    mockMessageService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockRoomService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getUsersInRoom: jest.fn(),
    };

    // Create gateway instance
    gateway = new TestChatGateway(mockMessageService, mockRoomService);

    // Setup mocks
    mockServer = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    mockClient = {
      id: testClientId,
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      broadcast: {
        to: jest.fn().mockReturnThis(),
        emit: jest.fn(),
      },
      handshake: {
        headers: {},
        time: '',
        address: '127.0.0.1',
        xdomain: false,
        secure: false,
        issued: Date.now(),
        url: '/socket.io/',
        query: {},
        auth: {},
      },
    };

    gateway.server = mockServer as Server;
  });

  describe('Gateway Initialization', () => {
    it('should be defined', () => {
      expect(gateway).toBeDefined();
    });

    it('should have required services injected', () => {
      expect(gateway['messageService']).toBeDefined();
      expect(gateway['roomService']).toBeDefined();
    });

    it('should have server property defined after setup', () => {
      expect(gateway.server).toBeDefined();
      expect(gateway.server).toBe(mockServer);
    });
  });

  describe('Connection Lifecycle', () => {
    describe('handleConnection', () => {
      it('should log connection with formatted timestamp', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        gateway.handleConnection(mockClient as Socket);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`User connected: ${testClientId}`),
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringMatching(
            /User connected: .+ \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/,
          ),
        );

        consoleSpy.mockRestore();
      });

      it('should handle multiple concurrent connections', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const client2 = { ...mockClient, id: 'client-2' };
        const client3 = { ...mockClient, id: 'client-3' };

        gateway.handleConnection(mockClient as Socket);
        gateway.handleConnection(client2 as Socket);
        gateway.handleConnection(client3 as Socket);

        expect(consoleSpy).toHaveBeenCalledTimes(3);
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('client-2'),
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('client-3'),
        );

        consoleSpy.mockRestore();
      });
    });

    describe('handleDisconnect', () => {
      it('should log disconnection with formatted timestamp', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        gateway.handleDisconnect(mockClient as Socket);

        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining(`User disconnected: ${testClientId}`),
        );
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringMatching(
            /User disconnected: .+ \d{2}\/\d{2}\/\d{4}, \d{2}:\d{2}:\d{2}/,
          ),
        );

        consoleSpy.mockRestore();
      });
    });
  });

  describe('Room Management', () => {
    describe('handleJoinRoom', () => {
      it('should successfully join room and emit confirmation', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        await gateway.handleJoinRoom(mockClient as Socket, testRoomId);

        expect(mockClient.join).toHaveBeenCalledWith(testRoomId);
        expect(mockClient.join).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(
          `Client ${testClientId} joined room ${testRoomId}`,
        );
        expect(mockClient.emit).toHaveBeenCalledWith('joinedRoom', {
          roomId: testRoomId,
        });

        consoleSpy.mockRestore();
      });

      it('should handle multiple room joins', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        const room2 = '507f1f77bcf86cd799439014';

        await gateway.handleJoinRoom(mockClient as Socket, testRoomId);
        await gateway.handleJoinRoom(mockClient as Socket, room2);

        expect(mockClient.join).toHaveBeenNthCalledWith(1, testRoomId);
        expect(mockClient.join).toHaveBeenNthCalledWith(2, room2);
        expect(mockClient.emit).toHaveBeenCalledTimes(2);

        consoleSpy.mockRestore();
      });
    });

    describe('handleLeaveRoom', () => {
      it('should successfully leave room and emit confirmation', () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

        gateway.handleLeaveRoom(mockClient as Socket, testRoomId);

        expect(mockClient.leave).toHaveBeenCalledWith(testRoomId);
        expect(mockClient.leave).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith(
          `Client ${testClientId} left room ${testRoomId}`,
        );
        expect(mockClient.emit).toHaveBeenCalledWith('leftRoom', {
          roomId: testRoomId,
        });

        consoleSpy.mockRestore();
      });
    });

    describe('handleListUsersInRoom', () => {
      it('should retrieve and emit users in room', async () => {
        const mockUsers = createMockUsers();
        mockRoomService.getUsersInRoom.mockResolvedValue(mockUsers);

        await gateway.handleListUsersInRoom(mockClient as Socket, testRoomId);

        expect(mockRoomService.getUsersInRoom).toHaveBeenCalledWith(testRoomId);
        expect(mockRoomService.getUsersInRoom).toHaveBeenCalledTimes(1);
        expect(mockClient.emit).toHaveBeenCalledWith('usersInRoom', mockUsers);
      });

      it('should handle empty rooms', async () => {
        mockRoomService.getUsersInRoom.mockResolvedValue([]);

        await gateway.handleListUsersInRoom(mockClient as Socket, testRoomId);

        expect(mockRoomService.getUsersInRoom).toHaveBeenCalledWith(testRoomId);
        expect(mockClient.emit).toHaveBeenCalledWith('usersInRoom', []);
      });

      it('should handle room service errors', async () => {
        const error = new Error('Room not found');
        mockRoomService.getUsersInRoom.mockRejectedValue(error);

        await expect(
          gateway.handleListUsersInRoom(mockClient as Socket, testRoomId),
        ).rejects.toThrow('Room not found');

        expect(mockRoomService.getUsersInRoom).toHaveBeenCalledWith(testRoomId);
        expect(mockClient.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Message Handling', () => {
    describe('handleSendMessage', () => {
      const createMessagePayload = () => ({
        createMessageDto: {
          content: 'Hello, world!',
          room: testRoomId,
        } as CreateMessageDto,
        user: createMockPayload(),
      });

      it('should create message and emit to client and broadcast to room', async () => {
        const payload = createMessagePayload();
        const mockSavedMessage = createMockMessage();
        mockMessageService.create.mockResolvedValue(mockSavedMessage);

        await gateway.handleSendMessage(mockClient as Socket, payload);

        expect(mockMessageService.create).toHaveBeenCalledWith(
          payload.createMessageDto,
          payload.user,
        );
        expect(mockMessageService.create).toHaveBeenCalledTimes(1);

        expect(mockClient.emit).toHaveBeenCalledWith(
          'messageSent',
          mockSavedMessage,
        );
        expect(mockClient.broadcast.to).toHaveBeenCalledWith(testRoomId);
        expect(mockClient.broadcast.emit).toHaveBeenCalledWith(
          'newMessage',
          mockSavedMessage,
        );
      });

      it('should handle different message types and lengths', async () => {
        const payloads = [
          {
            ...createMessagePayload(),
            createMessageDto: { content: 'Short', room: testRoomId },
          },
          {
            ...createMessagePayload(),
            createMessageDto: { content: 'A'.repeat(100), room: testRoomId },
          },
          {
            ...createMessagePayload(),
            createMessageDto: {
              content: '🚀 Emoji message! 🎉',
              room: testRoomId,
            },
          },
        ];

        for (const payload of payloads) {
          const mockMessage = {
            ...createMockMessage(),
            content: payload.createMessageDto.content,
          };
          mockMessageService.create.mockResolvedValue(mockMessage);

          await gateway.handleSendMessage(mockClient as Socket, payload);

          expect(mockMessageService.create).toHaveBeenCalledWith(
            payload.createMessageDto,
            payload.user,
          );
        }

        expect(mockMessageService.create).toHaveBeenCalledTimes(3);
        expect(mockClient.emit).toHaveBeenCalledTimes(3);
      });

      it('should handle message creation failures', async () => {
        const payload = createMessagePayload();
        const error = new Error('Database connection failed');
        mockMessageService.create.mockRejectedValue(error);

        await expect(
          gateway.handleSendMessage(mockClient as Socket, payload),
        ).rejects.toThrow('Database connection failed');

        expect(mockMessageService.create).toHaveBeenCalledWith(
          payload.createMessageDto,
          payload.user,
        );
        expect(mockClient.emit).not.toHaveBeenCalled();
        expect(mockClient.broadcast.to).not.toHaveBeenCalled();
        expect(mockClient.broadcast.emit).not.toHaveBeenCalled();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle full chat session workflow', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const payload = {
        createMessageDto: {
          content: 'Integration test message',
          room: testRoomId,
        },
        user: createMockPayload(),
      };
      const mockMessage = createMockMessage();
      const mockUsers = createMockUsers();

      mockMessageService.create.mockResolvedValue(mockMessage);
      mockRoomService.getUsersInRoom.mockResolvedValue(mockUsers);

      // Simulate full workflow
      gateway.handleConnection(mockClient as Socket);
      await gateway.handleJoinRoom(mockClient as Socket, testRoomId);
      await gateway.handleSendMessage(mockClient as Socket, payload);
      await gateway.handleListUsersInRoom(mockClient as Socket, testRoomId);
      gateway.handleLeaveRoom(mockClient as Socket, testRoomId);
      gateway.handleDisconnect(mockClient as Socket);

      // Verify complete workflow
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('User connected'),
      );
      expect(mockClient.join).toHaveBeenCalledWith(testRoomId);
      expect(mockMessageService.create).toHaveBeenCalledWith(
        payload.createMessageDto,
        payload.user,
      );
      expect(mockRoomService.getUsersInRoom).toHaveBeenCalledWith(testRoomId);
      expect(mockClient.leave).toHaveBeenCalledWith(testRoomId);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('User disconnected'),
      );

      consoleSpy.mockRestore();
    });
  });
});
