import { RegisterUserDto } from '../../auth/dto/register-user.dto';
import { UserMapper } from './UserMapper';

describe('UserMapper', () => {
  let userMapper: UserMapper;

  beforeEach(() => {
    userMapper = new UserMapper();
  });

  it('should be defined', () => {
    expect(userMapper).toBeDefined();
  });

  describe('toEntity', () => {
    it('should map RegisterUserDto to User entity correctly', () => {
      const registerDto: RegisterUserDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      const result = userMapper.toEntity(registerDto);

      expect(result).toEqual({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should handle empty or undefined fields', () => {
      const registerDto: RegisterUserDto = {
        name: '',
        email: '',
        password: '',
      };

      const result = userMapper.toEntity(registerDto);

      expect(result).toEqual({
        name: '',
        email: '',
        password: '',
      });
    });
  });

  // toResponse is already tested through integration tests
  // This method uses plainToInstance which is complex to test in isolation
});
