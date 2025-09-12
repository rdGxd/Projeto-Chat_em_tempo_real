import { Types } from 'mongoose';
import { RoomMapper } from './room-mapper';

describe('RoomMapper', () => {
  let roomMapper: RoomMapper;

  beforeEach(() => {
    roomMapper = new RoomMapper();
  });

  it('should be defined', () => {
    expect(roomMapper).toBeDefined();
  });

  describe('toResponse', () => {
    it('should map room entity to response DTO correctly', () => {
      const mockRoom = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Test Room',
        users: [
          {
            _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
            name: 'Test User',
            email: 'test@example.com',
          },
        ],
        owner: {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          name: 'Owner User',
          email: 'owner@example.com',
        },
        messages: [
          {
            _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
            content: 'Test message',
            author: {
              _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
              name: 'Author User',
              email: 'author@example.com',
            },
            createdAt: new Date('2023-01-01T10:00:00Z'),
            updatedAt: new Date('2023-01-01T10:00:00Z'),
          },
        ],
        createdAt: new Date('2023-01-01T09:00:00Z'),
        updatedAt: new Date('2023-01-01T09:30:00Z'),
      };

      const result = roomMapper.toResponse(mockRoom);

      expect(result.id).toBe('507f1f77bcf86cd799439011');
      expect(result.name).toBe('Test Room');
      expect(result.users).toHaveLength(1);
      expect(result.users[0]).toEqual({
        id: '507f1f77bcf86cd799439012',
        name: 'Test User',
        email: 'test@example.com',
      });
      expect(result.owner).toEqual({
        id: '507f1f77bcf86cd799439012',
        name: 'Owner User',
        email: 'owner@example.com',
      });
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]).toEqual({
        id: '507f1f77bcf86cd799439013',
        content: 'Test message',
        author: {
          id: '507f1f77bcf86cd799439012',
          name: 'Author User',
          email: 'author@example.com',
        },
        createdAt: '2023-01-01T10:00:00.000Z',
        updatedAt: '2023-01-01T10:00:00.000Z',
      });
      expect(result.createdAt).toBe('2023-01-01T09:00:00.000Z');
      expect(result.updatedAt).toBe('2023-01-01T09:30:00.000Z');
    });

    it('should handle room with no author in messages', () => {
      const mockRoom = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Test Room',
        users: [],
        owner: {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          name: 'Owner User',
          email: 'owner@example.com',
        },
        messages: [
          {
            _id: new Types.ObjectId('507f1f77bcf86cd799439013'),
            content: 'Test message without author',
            author: null,
            createdAt: new Date('2023-01-01T10:00:00Z'),
            updatedAt: new Date('2023-01-01T10:00:00Z'),
          },
        ],
        createdAt: new Date('2023-01-01T09:00:00Z'),
        updatedAt: new Date('2023-01-01T09:30:00Z'),
      };

      const result = roomMapper.toResponse(mockRoom);

      expect(result.messages[0].author).toBeUndefined();
    });

    it('should handle empty arrays for users and messages', () => {
      const mockRoom = {
        _id: new Types.ObjectId('507f1f77bcf86cd799439011'),
        name: 'Empty Room',
        users: [],
        owner: {
          _id: new Types.ObjectId('507f1f77bcf86cd799439012'),
          name: 'Owner User',
          email: 'owner@example.com',
        },
        messages: [],
        createdAt: new Date('2023-01-01T09:00:00Z'),
        updatedAt: new Date('2023-01-01T09:30:00Z'),
      };

      const result = roomMapper.toResponse(mockRoom);

      expect(result.users).toEqual([]);
      expect(result.messages).toEqual([]);
    });
  });

  describe('toEntity', () => {
    it('should map CreateRoomDto to entity correctly', () => {
      const createRoomDto = {
        name: 'New Room',
      };
      const userId = '507f1f77bcf86cd799439012';

      const result = roomMapper.toEntity(createRoomDto, userId);

      expect(result.name).toBe('New Room');
      expect(result.users).toHaveLength(1);
      expect(result.users![0]).toEqual(new Types.ObjectId(userId));
      expect(result.messages).toEqual([]);
      expect(result.owner).toEqual(new Types.ObjectId(userId));
    });
  });
});
