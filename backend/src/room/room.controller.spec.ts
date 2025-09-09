import { Test, TestingModule } from '@nestjs/testing';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

describe('RoomController', () => {
  let controller: RoomController;
  let roomService: RoomService;

  const mockRoomService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoomController],
      providers: [
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    controller = module.get<RoomController>(RoomController);
    roomService = module.get<RoomService>(RoomService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(roomService).toBeDefined();
  });

  describe('create', () => {
    it('should create a room', async () => {
      const createRoomDto = { name: 'Test Room' };
      const tokenPayload = { sub: 'user-id' } as any;
      const expectedResult = { id: 'room-id', name: 'Test Room' };

      jest
        .spyOn(roomService, 'create')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.create(createRoomDto, tokenPayload);

      expect(roomService.create).toHaveBeenCalledWith(
        createRoomDto,
        tokenPayload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all rooms', async () => {
      const expectedResult = [{ id: 'room-id', name: 'Test Room' }];

      jest
        .spyOn(roomService, 'findAll')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.findAll();

      expect(roomService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return one room by id', async () => {
      const roomId = 'room-id';
      const expectedResult = { id: 'room-id', name: 'Test Room' };

      jest
        .spyOn(roomService, 'findOne')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(roomId);

      expect(roomService.findOne).toHaveBeenCalledWith(roomId);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a room', async () => {
      const roomId = 'room-id';
      const tokenPayload = { sub: 'user-id' } as any;

      jest.spyOn(roomService, 'remove').mockResolvedValue(undefined);

      await controller.remove(roomId, tokenPayload);

      expect(roomService.remove).toHaveBeenCalledWith(roomId, tokenPayload);
    });
  });
});
