import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, Types } from 'mongoose';
import jwtConfig from 'src/common/config/jwtConfig';
import { HashingProtocol } from 'src/common/HashingPassword/HashingProtocol';
import { User, UserDocument } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { AuthMapper } from './mapper/auth-mapper';

describe('AuthService', () => {
  let authService: AuthService;
  let userModel: Model<UserDocument>;
  let hashingService: HashingProtocol;
  let userService: UserService;
  let jwtService: JwtService;
  let authMapper: AuthMapper;

  const mockJwtConfig: ConfigType<typeof jwtConfig> = {
    secret: 'test_secret',
    signOptions: {
      audience: 'test_audience',
      issuer: 'test_issuer',
      expiresIn: 3600,
    },
    refreshToken: 86400,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            create: jest.fn(),
            findOneByPayload: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
          },
        },
        {
          provide: HashingProtocol,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verify: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: jwtConfig.KEY,
          useValue: mockJwtConfig,
        },
        {
          provide: AuthMapper,
          useValue: {
            toDto: jest.fn(),
          }, // Mock AuthMapper methods as needed
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<UserDocument>>('UserModel');
    userService = module.get<UserService>(UserService);
    hashingService = module.get<HashingProtocol>(HashingProtocol);
    jwtService = module.get<JwtService>(JwtService);
    authMapper = module.get<AuthMapper>(AuthMapper);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(userModel).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(authMapper).toBeDefined();
  });

  describe('login', () => {
    it('should throw NotFoundException if user not found', async () => {
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(null as any);

      await expect(
        authService.login({ email: 'test@example.com', password: 'password' }),
      ).rejects.toThrow(NotFoundException);
      expect(userService.findByEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser: Partial<User> = {
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongPassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
      expect(hashingService.compare).toHaveBeenCalledWith(
        'wrongPassword',
        'hashedPassword',
      );
    });

    it('should return token if login is successful', async () => {
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
        password: 'hashedPassword',
      };
      jest.spyOn(userService, 'findByEmail').mockResolvedValue(mockUser as any);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async (...args) => 'mockToken');
      jest
        .spyOn(authMapper, 'toDto')
        .mockImplementation((user) => ({ ...user, accessToken: 'mockToken' }));

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password',
      });

      expect(result.accessToken).toBe('mockToken');
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password',
      };
      const mockCreatedUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      jest
        .spyOn(userService, 'create')
        .mockResolvedValue(mockCreatedUser as any);

      const result = await authService.register(registerDto);

      expect(userService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(mockCreatedUser);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockPayload = {
        sub: 'user-id',
        email: 'test@example.com',
        roles: ['user'],
        iat: 1234567890,
        exp: 1234567890,
        aud: 'test',
        iss: 'test',
      } as any;
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
      };

      jest
        .spyOn(userService, 'findOneByPayload')
        .mockResolvedValue(mockUser as any);

      const result = await authService.getProfile(mockPayload);

      expect(userService.findOneByPayload).toHaveBeenCalledWith(mockPayload);
      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens successfully', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };
      const mockUser = {
        _id: new Types.ObjectId(),
        email: 'test@example.com',
      };
      const mockTokens = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600,
        refreshTokenExpiresIn: 86400,
      };

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: mockUser._id.toString() });
      jest.spyOn(userService, 'findById').mockResolvedValue(mockUser as any);
      jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('new-access-token')
        .mockResolvedValueOnce('new-refresh-token');
      jest.spyOn(authMapper, 'toDto').mockReturnValue(mockTokens as any);

      const result = await authService.refreshTokens(refreshTokenDto);

      expect(jwtService.verifyAsync).toHaveBeenCalledWith(
        'valid-refresh-token',
        expect.objectContaining({
          secret: mockJwtConfig.secret,
          audience: mockJwtConfig.signOptions.audience,
          issuer: mockJwtConfig.signOptions.issuer,
        }),
      );
      expect(userService.findById).toHaveBeenCalledWith(
        mockUser._id.toString(),
      );
      expect(result).toEqual(mockTokens);
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      const refreshTokenDto = { refreshToken: 'invalid-refresh-token' };

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValue(new Error('Invalid token'));

      await expect(authService.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found during refresh', async () => {
      const refreshTokenDto = { refreshToken: 'valid-refresh-token' };

      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValue({ sub: 'non-existent-user-id' });
      jest.spyOn(userService, 'findById').mockResolvedValue(null as any);

      // O método captura qualquer erro dentro do try/catch e transforma em UnauthorizedException
      await expect(authService.refreshTokens(refreshTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
