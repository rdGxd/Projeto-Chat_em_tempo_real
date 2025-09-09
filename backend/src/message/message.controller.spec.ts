import { Test, TestingModule } from '@nestjs/testing';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

describe('MessageController', () => {
  let controller: MessageController;
  let messageService: MessageService;

  const mockMessageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MessageController],
      providers: [
        {
          provide: MessageService,
          useValue: mockMessageService,
        },
      ],
    }).compile();

    controller = module.get<MessageController>(MessageController);
    messageService = module.get<MessageService>(MessageService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(messageService).toBeDefined();
  });

  describe('create', () => {
    it('should create a message', async () => {
      const createMessageDto = { content: 'Test message', room: 'room-id' };
      const tokenPayload = { sub: 'user-id' } as any;
      const expectedResult = { id: 'message-id', content: 'Test message' };

      jest
        .spyOn(messageService, 'create')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.create(createMessageDto, tokenPayload);

      expect(messageService.create).toHaveBeenCalledWith(
        createMessageDto,
        tokenPayload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll', () => {
    it('should return all messages for a room', async () => {
      const tokenPayload = { sub: 'room-id' } as any;
      const expectedResult = [{ id: 'message-id', content: 'Test message' }];

      jest
        .spyOn(messageService, 'findAll')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.findAll(tokenPayload);

      expect(messageService.findAll).toHaveBeenCalledWith(tokenPayload.sub);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne', () => {
    it('should return one message by id', async () => {
      const messageId = 'message-id';
      const tokenPayload = { sub: 'user-id' } as any;
      const expectedResult = { id: 'message-id', content: 'Test message' };

      jest
        .spyOn(messageService, 'findOne')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.findOne(messageId, tokenPayload);

      expect(messageService.findOne).toHaveBeenCalledWith(
        messageId,
        tokenPayload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update', () => {
    it('should update a message', async () => {
      const messageId = 'message-id';
      const updateMessageDto = { content: 'Updated message' };
      const tokenPayload = { sub: 'user-id' } as any;
      const expectedResult = { id: 'message-id', content: 'Updated message' };

      jest
        .spyOn(messageService, 'update')
        .mockResolvedValue(expectedResult as any);

      const result = await controller.update(
        messageId,
        updateMessageDto,
        tokenPayload,
      );

      expect(messageService.update).toHaveBeenCalledWith(
        messageId,
        updateMessageDto,
        tokenPayload,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove', () => {
    it('should remove a message', async () => {
      const messageId = 'message-id';
      const tokenPayload = { sub: 'user-id' } as any;

      jest.spyOn(messageService, 'remove').mockResolvedValue(undefined as any);

      await controller.remove(messageId, tokenPayload);

      expect(messageService.remove).toHaveBeenCalledWith(
        messageId,
        tokenPayload,
      );
    });
  });
});
