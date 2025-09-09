import { getModelToken } from '@nestjs/mongoose';
import { Test } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import { Roles } from 'src/common/enums/role';
import { Room, RoomDocument } from './entities/room.entity';
import { RoomMapper } from './mapper/room-mapper';
import { RoomService } from './room.service';

describe('RoomService', () => {
  let roomService: RoomService;
  let roomMapper: RoomMapper;
  let roomModel: Model<RoomDocument>;

  const mockPayload = {
    sub: 'user-id',
    email: 'user@example.com',
    roles: [Roles.USER],
    iat: Date.now(),
    exp: Date.now() + 3600,
    aud: 'chat-app',
    iss: 'chat-app',
  };

  const mockCreateRoomDto = {
    name: 'Test Room',
  };

  const mockObjectId = new Types.ObjectId('507f1f77bcf86cd799439011');
  const mockUserId = new Types.ObjectId('507f1f77bcf86cd799439012');

  const mockRoomEntity = {
    _id: mockObjectId,
    name: 'Test Room',
    owner: mockUserId,
    users: [mockUserId],
    messages: [] as Types.ObjectId[],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRoomResponse = {
    id: 'room-id',
    name: 'Test Room',
    owner: 'user-id',
    users: ['user-id'],
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoomService,
        {
          provide: RoomMapper,
          useValue: {
            toEntity: jest.fn(),
            toResponse: jest.fn(),
          },
        },
        {
          provide: getModelToken(Room.name),
          useValue: {
            create: jest.fn(),
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            populate: jest.fn(),
          },
        },
      ],
    }).compile();

    roomService = module.get<RoomService>(RoomService);
    roomMapper = module.get<RoomMapper>(RoomMapper);
    roomModel = module.get<Model<RoomDocument>>(getModelToken(Room.name));
  });

  it('should be defined', () => {
    expect(roomService).toBeDefined();
    expect(roomMapper).toBeDefined();
    expect(roomModel).toBeDefined();
  });

  describe('create', () => {
    it('should create a room', async () => {
      jest.spyOn(roomMapper, 'toEntity').mockReturnValue(mockRoomEntity as any);
      jest.spyOn(roomModel, 'create').mockResolvedValue(mockRoomEntity as any);
      jest
        .spyOn(roomMapper, 'toResponse')
        .mockReturnValue(mockRoomResponse as any);

      const result = await roomService.create(mockCreateRoomDto, mockPayload);

      expect(roomMapper.toEntity).toHaveBeenCalledWith(
        mockCreateRoomDto,
        mockPayload.sub,
      );
      expect(roomModel.create).toHaveBeenCalledWith(mockRoomEntity);
      expect(roomMapper.toResponse).toHaveBeenCalledWith(mockRoomEntity);
      expect(result).toEqual(mockRoomResponse);
    });
  });

  describe('findAll', () => {
    it('should get all rooms and map them to response DTOs', async () => {
      const mockRooms = [mockRoomEntity];
      const mockResponses = [mockRoomResponse];

      // Mock da query encadeada do Mongoose que retorna uma Promise
      jest.spyOn(roomModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockRooms),
        }),
      } as any);

      jest
        .spyOn(roomMapper, 'toResponse')
        .mockReturnValue(mockRoomResponse as any);

      const result = await roomService.findAll();

      // 1️⃣ Verifica se find foi chamado
      expect(roomModel.find).toHaveBeenCalled();

      // 3️⃣ Verifica se mapper foi chamado para cada room
      expect(roomMapper.toResponse).toHaveBeenCalledTimes(mockRooms.length);
      mockRooms.forEach((room) => {
        expect(roomMapper.toResponse).toHaveBeenCalledWith(room);
      });

      // 4️⃣ Verifica o retorno final
      expect(result).toEqual(mockResponses);
    });

    it('should throw NotFoundException when no rooms are found', async () => {
      // Mock da query que retorna null
      jest.spyOn(roomModel, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      await expect(roomService.findAll()).rejects.toThrow('Room not found');

      expect(roomModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should find a room by id and return mapped response', async () => {
      const roomId = 'room-id';

      // Mock da query encadeada do Mongoose para findById
      jest.spyOn(roomModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(mockRoomEntity),
        }),
      } as any);

      jest
        .spyOn(roomMapper, 'toResponse')
        .mockReturnValue(mockRoomResponse as any);

      const result = await roomService.findOne(roomId);

      expect(roomModel.findById).toHaveBeenCalledWith(roomId);
      expect(roomMapper.toResponse).toHaveBeenCalledWith(mockRoomEntity);
      expect(result).toEqual(mockRoomResponse);
    });

    it('should throw NotFoundException when room is not found', async () => {
      const roomId = 'non-existent-id';

      // Mock da query que retorna null
      jest.spyOn(roomModel, 'findById').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      await expect(roomService.findOne(roomId)).rejects.toThrow(
        'Room not found',
      );

      expect(roomModel.findById).toHaveBeenCalledWith(roomId);
    });
  });
  describe('updateMessages', () => {
    it('should update room with new message', async () => {
      const roomId = '507f1f77bcf86cd799439011';
      const messageId = new Types.ObjectId('507f1f77bcf86cd799439013');
      const updatedRoom = { ...mockRoomEntity, messages: [messageId] };

      jest
        .spyOn(roomModel, 'findByIdAndUpdate')
        .mockResolvedValue(updatedRoom as any);

      await roomService.updateMessages(roomId, messageId);

      expect(roomModel.findByIdAndUpdate).toHaveBeenCalledWith(
        roomId,
        { $push: { messages: messageId } },
        { new: true },
      );
    });
  });

  describe('remove', () => {
    const mockOwnerPayload = {
      sub: '507f1f77bcf86cd799439012',
      email: 'owner@example.com',
      roles: ['user'],
      iat: Date.now(),
      exp: Date.now() + 3600,
      aud: 'chat-app',
      iss: 'chat-app',
    };

    const mockOwnerId = new Types.ObjectId('507f1f77bcf86cd799439012');
    const mockRoomWithOwner = {
      _id: mockObjectId,
      name: 'Test Room',
      owner: {
        toString: () => '507f1f77bcf86cd799439012',
      },
      users: [mockOwnerId],
      messages: [] as Types.ObjectId[],
    };

    it('should remove room when user is the owner', async () => {
      jest
        .spyOn(roomModel, 'findById')
        .mockResolvedValue(mockRoomWithOwner as any);
      jest
        .spyOn(roomModel, 'findByIdAndDelete')
        .mockResolvedValue(mockRoomWithOwner as any);

      await roomService.remove(
        '507f1f77bcf86cd799439011',
        mockOwnerPayload as any,
      );

      expect(roomModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(roomModel.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException when room does not exist', async () => {
      jest.spyOn(roomModel, 'findById').mockResolvedValue(null);

      await expect(
        roomService.remove('non-existent-id', mockOwnerPayload as any),
      ).rejects.toThrow('Room not found');

      expect(roomModel.findById).toHaveBeenCalledWith('non-existent-id');
      expect(roomModel.findByIdAndDelete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenException when user is not the owner', async () => {
      const nonOwnerPayload = {
        sub: 'different-user-id',
        email: 'user@example.com',
        roles: ['user'],
        iat: Date.now(),
        exp: Date.now() + 3600,
        aud: 'chat-app',
        iss: 'chat-app',
      };

      jest
        .spyOn(roomModel, 'findById')
        .mockResolvedValue(mockRoomWithOwner as any);

      await expect(
        roomService.remove('507f1f77bcf86cd799439011', nonOwnerPayload as any),
      ).rejects.toThrow('You are not allowed to delete this room');

      expect(roomModel.findById).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
      expect(roomModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
