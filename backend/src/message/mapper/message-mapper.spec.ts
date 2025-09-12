import { Types } from 'mongoose';
import { CreateMessageDto } from '../dto/create-message.dto';
import { Message } from '../entities/message.entity';
import { MessageMapper } from './message-mapper';

describe('MessageMapper', () => {
  let messageMapper: MessageMapper;

  beforeEach(() => {
    messageMapper = new MessageMapper();
  });

  it('should be defined', () => {
    expect(messageMapper).toBeDefined();
  });

  describe('toEntity', () => {
    it('should map CreateMessageDto to Message entity correctly', () => {
      const createMessageDto: CreateMessageDto = {
        content: 'Test message content',
        room: '507f1f77bcf86cd799439011',
      };
      const userId = '507f1f77bcf86cd799439012';

      const result = messageMapper.toEntity(createMessageDto, userId);

      expect(result.content).toBe('Test message content');
      expect(result.author).toEqual(new Types.ObjectId(userId));
      expect(result.room).toEqual(new Types.ObjectId(createMessageDto.room));
    });

    it('should handle empty content', () => {
      const createMessageDto: CreateMessageDto = {
        content: '',
        room: '507f1f77bcf86cd799439011',
      };
      const userId = '507f1f77bcf86cd799439012';

      const result = messageMapper.toEntity(createMessageDto, userId);

      expect(result.content).toBe('');
      expect(result.author).toEqual(new Types.ObjectId(userId));
      expect(result.room).toEqual(new Types.ObjectId(createMessageDto.room));
    });
  });

  describe('toResponse', () => {
    it('should call toResponse method', () => {
      const message = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
        content: 'Test message',
        author: new Types.ObjectId('507f1f77bcf86cd799439012'),
        room: new Types.ObjectId('507f1f77bcf86cd799439011'),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Partial<Message>;

      const spy = jest.spyOn(messageMapper, 'toResponse');
      messageMapper.toResponse(message as Message);
      expect(spy).toHaveBeenCalledWith(message);
    });
  });
});
