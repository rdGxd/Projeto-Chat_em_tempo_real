import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { Roles } from '../common/enums/role';
import { RoomService } from '../room/room.service';
import { UserService } from '../user/user.service';
import { Message, MessageDocument } from './entities/message.entity';
import { MessageMapper } from './mapper/message-mapper';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let service: MessageService;
  let messageModel: Model<MessageDocument>;
  let messageMapper: MessageMapper;
  let userService: UserService;
  let roomService: RoomService;

  const mockPayload = {
    sub: 'user-id',
    email: 'user@example.com',
    roles: [Roles.USER],
    iat: Date.now(),
    exp: Date.now() + 3600,
    aud: 'chat-app',
    iss: 'chat-app',
  };

  const mockObjectId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockUserId = new Types.ObjectId('507f1f77bcf86cd799439012');
  const mockRoomId = new Types.ObjectId('507f1f77bcf86cd799439013');

  const mockCreateMessageDto = {
    content: 'Test message',
    room: 'room-id',
  };

  const mockMessageEntity = {
    _id: mockObjectId,
    content: 'Test message',
    author: mockUserId,
    room: mockRoomId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMessageResponse = {
    id: 'message-id',
    content: 'Test message',
    author: 'user-id',
    room: 'room-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUser = {
    _id: mockUserId,
    name: 'Test User',
    email: 'user@example.com',
  };

  const mockRoom = {
    _id: mockRoomId,
    name: 'Test Room',
    owner: mockUserId,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessageService,
        {
          provide: getModelToken(Message.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn(),
          },
        },
        {
          provide: MessageMapper,
          useValue: {
            toEntity: jest.fn(),
            toResponse: jest.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: RoomService,
          useValue: {
            findOne: jest.fn(),
            updateMessages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MessageService>(MessageService);
    messageModel = module.get<Model<MessageDocument>>(
      getModelToken(Message.name),
    );
    messageMapper = module.get<MessageMapper>(MessageMapper);
    userService = module.get<UserService>(UserService);
    roomService = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(messageModel).toBeDefined();
    expect(messageMapper).toBeDefined();
    expect(userService).toBeDefined();
    expect(roomService).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);
      jest
        .spyOn(roomService, 'findOne')
        .mockResolvedValue({ ...mockRoom, id: mockRoom._id } as any);
      jest
        .spyOn(messageMapper, 'toEntity')
        .mockReturnValue(mockMessageEntity as any);
      jest
        .spyOn(messageModel, 'create')
        .mockResolvedValue(mockMessageEntity as any);
      jest.spyOn(roomService, 'updateMessages').mockResolvedValue(undefined as any);

      // Mock para o retorno final do método - corrigindo o chain do populate
      const mockPopulateResult = {
        populate: jest.fn().mockResolvedValue(mockMessageEntity),
      };
      jest
        .spyOn(messageModel, 'findById')
        .mockReturnValue(mockPopulateResult as any);

      // Mock para o mapeamento da resposta final
      jest
        .spyOn(messageMapper, 'toResponse')
        .mockReturnValue(mockMessageResponse as any);

      const result = await service.create(mockCreateMessageDto, mockPayload);

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(roomService.findOne).toHaveBeenCalledWith(
        mockCreateMessageDto.room,
      );
      expect(messageMapper.toEntity).toHaveBeenCalledWith(
        mockCreateMessageDto,
        mockUser._id.toString(),
      );
      expect(messageModel.create).toHaveBeenCalledWith(mockMessageEntity);
      expect(roomService.updateMessages).toHaveBeenCalled();
      expect(result).toEqual(mockMessageResponse);
    });

    it('should throw error when user is not found', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(null as any);
      jest.spyOn(roomService, 'findOne').mockResolvedValue(mockRoom as any);

      await expect(
        service.create(mockCreateMessageDto, mockPayload),
      ).rejects.toThrow('User or Room not found');

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(roomService.findOne).toHaveBeenCalledWith(
        mockCreateMessageDto.room,
      );
    });

    it('should throw error when room is not found', async () => {
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);
      jest.spyOn(roomService, 'findOne').mockResolvedValue(null as any);

      await expect(
        service.create(mockCreateMessageDto, mockPayload),
      ).rejects.toThrow('User or Room not found');

      expect(userService.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(roomService.findOne).toHaveBeenCalledWith(
        mockCreateMessageDto.room,
      );
    });
  });

  describe('findAll', () => {
    it('should return all messages for a room', async () => {
      const roomId = 'room-id';
      const mockMessages = [mockMessageEntity];

      jest.spyOn(messageModel, 'find').mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockMessages),
      } as any);

      jest
        .spyOn(messageMapper, 'toResponse')
        .mockReturnValue(mockMessageResponse as any);

      const result = await service.findAll(roomId);

      expect(messageModel.find).toHaveBeenCalledWith({ room: roomId });
      expect(messageMapper.toResponse).toHaveBeenCalledTimes(
        mockMessages.length,
      );
      expect(result).toEqual([mockMessageResponse]);
    });
  });

  describe('findOne', () => {
    it('should find a message by id', async () => {
      const messageId = 'message-id';

      // Mock do método privado verifyMessageOwnership
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockResolvedValue(mockMessageEntity);
      jest
        .spyOn(messageMapper, 'toResponse')
        .mockReturnValue(mockMessageResponse as any);

      const result = await service.findOne(messageId, mockPayload);

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
      expect(messageMapper.toResponse).toHaveBeenCalledWith(mockMessageEntity);
      expect(result).toEqual(mockMessageResponse);
    });

    it('should throw NotFoundException when message is not found', async () => {
      const messageId = 'non-existent-id';

      // Mock do método privado que lança a exceção
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockRejectedValue(new Error('Message not found'));

      await expect(service.findOne(messageId, mockPayload)).rejects.toThrow(
        'Message not found',
      );

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = 'message-id';
      const updateMessageDto = { content: 'Updated message' };
      const updatedMessage = {
        ...mockMessageEntity,
        content: 'Updated message',
      };

      // Mock do método privado verifyMessageOwnership
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockResolvedValue(mockMessageEntity);

      jest.spyOn(messageModel, 'findByIdAndUpdate').mockReturnValue({
        populate: jest.fn().mockResolvedValue(updatedMessage),
      } as any);

      jest.spyOn(messageMapper, 'toResponse').mockReturnValue({
        ...mockMessageResponse,
        content: 'Updated message',
      } as any);

      const result = await service.update(
        messageId,
        updateMessageDto,
        mockPayload,
      );

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
      expect(messageModel.findByIdAndUpdate).toHaveBeenCalledWith(
        messageId,
        updateMessageDto,
        { new: true },
      );
      expect(messageMapper.toResponse).toHaveBeenCalledWith(mockMessageEntity);
      expect(result.content).toBe('Updated message');
    });

    it('should throw NotFoundException when message to update is not found', async () => {
      const messageId = 'non-existent-id';
      const updateMessageDto = { content: 'Updated message' };

      // Mock do método privado que lança a exceção
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockRejectedValue(new Error('Message not found'));

      await expect(
        service.update(messageId, updateMessageDto, mockPayload),
      ).rejects.toThrow('Message not found');

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const messageId = 'message-id';

      // Mock do método privado verifyMessageOwnership
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockResolvedValue(mockMessageEntity);
      jest
        .spyOn(messageModel, 'findByIdAndDelete')
        .mockResolvedValue(mockMessageEntity as any);
      jest
        .spyOn(messageMapper, 'toResponse')
        .mockReturnValue(mockMessageResponse as any);

      const result = await service.remove(messageId, mockPayload);

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
      expect(messageModel.findByIdAndDelete).toHaveBeenCalledWith(messageId);
      expect(messageMapper.toResponse).toHaveBeenCalledWith(mockMessageEntity);
      expect(result).toEqual(mockMessageResponse);
    });

    it('should throw NotFoundException when message to remove is not found', async () => {
      const messageId = 'non-existent-id';

      // Mock do método privado que lança a exceção
      jest
        .spyOn(service as any, 'verifyMessageOwnership')
        .mockRejectedValue(new Error('Message not found'));

      await expect(service.remove(messageId, mockPayload)).rejects.toThrow(
        'Message not found',
      );

      expect(service['verifyMessageOwnership']).toHaveBeenCalledWith(
        messageId,
        mockPayload.sub,
      );
    });
  });
});
