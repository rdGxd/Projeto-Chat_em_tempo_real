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
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const mockUser = {
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
        .mockReturnValue(Promise.resolve('mockToken'));
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
});
