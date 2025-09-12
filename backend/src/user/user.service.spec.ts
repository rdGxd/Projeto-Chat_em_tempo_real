import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { Roles } from 'src/common/enums/role';
import { HashingProtocol } from '../common/HashingPassword/HashingProtocol';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UserStatus } from './enum/UserStatus';
import { UserMapper } from './mappers/UserMapper';
import { UserService } from './user.service';

describe('UserService', () => {
  let userService: UserService;
  let userModel: Model<UserDocument>;
  let hashingService: HashingProtocol;
  let userMapper: UserMapper;

  const mockUser = {
    id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: [Roles.USER],
    status: UserStatus.OFFLINE,
  };

  const mockPayload: PayloadDto = {
    sub: mockUser.id,
    email: mockUser.email,
    roles: [Roles.USER],
    iat: 1234567890,
    exp: 1234567890,
    aud: 'test',
    iss: 'test',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: HashingProtocol,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
          },
        },
        {
          provide: UserMapper,
          useValue: {
            toEntity: jest.fn(),
            toResponse: jest.fn(),
          },
        },
        {
          provide: getModelToken(User.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndDelete: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    hashingService = module.get<HashingProtocol>(HashingProtocol);
    userMapper = module.get<UserMapper>(UserMapper);
    userModel = module.get<Model<UserDocument>>('UserModel');
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
    expect(userModel).toBeDefined();
    expect(hashingService).toBeDefined();
    expect(userMapper).toBeDefined();
  });

  describe('Create', () => {
    it('should create a new user', async () => {
      const userDto: RegisterUserDto = {
        name: 'John Doe',
        email: 'teste@teste.com',
        password: '123456',
      };
      const userEntity = {
        email: userDto.email,
        name: userDto.name,
        password: userDto.password,
      } as User;

      const expectedSaveParam = {
        email: userDto.email,
        name: userDto.name,
        password: 'hashedPassword',
      };

      jest.spyOn(userMapper, 'toEntity').mockReturnValue(userEntity);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashedPassword');
      jest.spyOn(userModel, 'create').mockResolvedValue(userEntity as any);
      jest.spyOn(userMapper, 'toResponse').mockReturnValue({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        createdAt: mockUser.createdAt.toISOString(),
        updatedAt: mockUser.updatedAt.toISOString(),
        roles: [Roles.USER],
        status: mockUser.status,
      });

      const result = await userService.create(userDto);

      expect(userMapper.toEntity).toHaveBeenCalledWith(userDto);
      expect(hashingService.hash).toHaveBeenCalledWith(userDto.password);
      expect(userModel.create).toHaveBeenCalledWith(expectedSaveParam);
      expect(userMapper.toResponse).toHaveBeenCalledWith(userEntity);
      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const userArray = [mockUser];
      const mappedUsers = [
        {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      ];

      jest.spyOn(userModel, 'find').mockResolvedValue(userArray);
      jest
        .spyOn(userMapper, 'toResponse')
        .mockReturnValue(mappedUsers[0] as any);

      const result = await userService.findAll();

      expect(userModel.find).toHaveBeenCalled();
      expect(userMapper.toResponse).toHaveBeenCalledTimes(userArray.length);
      expect(result).toEqual(mappedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user by id when user exists and is authorized', async () => {
      const mappedUser = {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userMapper, 'toResponse').mockReturnValue(mappedUser as any);

      const result = await userService.findOne(mockUser.id, mockPayload);

      expect(userModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userMapper.toResponse).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mappedUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(
        userService.findOne(mockUser.id, mockPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when user is not authorized', async () => {
      const unauthorizedPayload: PayloadDto = {
        sub: 'different-user-id',
        email: 'different@example.com',
        roles: [Roles.USER],
        iat: 1234567890,
        exp: 1234567890,
        aud: 'test',
        iss: 'test',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      await expect(
        userService.findOne(unauthorizedPayload.sub, mockPayload),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('update', () => {
    it('should update a user when user exists and is authorized', async () => {
      const updateUserDto: UpdateUserDto = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const updatedUser = {
        ...mockUser,
        ...updateUserDto,
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue(updatedUser);
      jest.spyOn(userMapper, 'toResponse').mockReturnValue(updatedUser as any);

      const result = await userService.update(
        mockUser.id,
        updateUserDto,
        mockPayload,
      );

      expect(userModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        { _id: mockUser.id },
        updateUserDto,
        {
          new: true,
          runValidators: true,
        },
      );
      expect(userMapper.toResponse).toHaveBeenCalledWith(updatedUser);
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(
        userService.update(mockUser.id, {}, mockPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when user is not authorized', async () => {
      const unauthorizedPayload: PayloadDto = {
        sub: 'different-user-id',
        email: 'different@example.com',
        roles: [Roles.USER],
        iat: 1234567890,
        exp: 1234567890,
        aud: 'test',
        iss: 'test',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      await expect(
        userService.update(mockUser.id, {}, unauthorizedPayload),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('updatePassword', () => {
    it('should update the password of a user when user exists and is authorized', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(true);
      jest.spyOn(hashingService, 'hash').mockResolvedValue('hashedNewPassword');
      jest.spyOn(userModel, 'findByIdAndUpdate').mockResolvedValue({
        ...mockUser,
        password: 'hashedNewPassword',
      });
      jest.spyOn(userMapper, 'toResponse').mockReturnValue(mockUser as any);

      const result = await userService.updatePassword(
        mockUser.id,
        updatePasswordDto,
        mockPayload,
      );

      expect(userModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(hashingService.compare).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        mockUser.password,
      );
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePasswordDto.newPassword,
      );
      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockUser.id,
        { password: 'hashedNewPassword' },
        { new: true },
      );
      expect(userMapper.toResponse).toHaveBeenCalledWith({
        ...mockUser,
        password: 'hashedNewPassword',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found during password update', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(
        userService.updatePassword(mockUser.id, updatePasswordDto, mockPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when user is not authorized for password update', async () => {
      const unauthorizedPayload: PayloadDto = {
        sub: 'different-user-id',
        email: 'different@example.com',
        roles: [Roles.USER],
        iat: 1234567890,
        exp: 1234567890,
        aud: 'test',
        iss: 'test',
      };

      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      await expect(
        userService.updatePassword(
          mockUser.id,
          updatePasswordDto,
          unauthorizedPayload,
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw error when old password is incorrect', async () => {
      const updatePasswordDto: UpdatePasswordDto = {
        oldPassword: 'wrongOldPassword',
        newPassword: 'newPassword',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(hashingService, 'compare').mockResolvedValue(false);

      await expect(
        userService.updatePassword(mockUser.id, updatePasswordDto, mockPayload),
      ).rejects.toThrow(UnauthorizedException);

      expect(hashingService.compare).toHaveBeenCalledWith(
        updatePasswordDto.oldPassword,
        mockUser.password,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user when user exists and is authorized', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userModel, 'findByIdAndDelete').mockResolvedValue(mockUser);
      jest.spyOn(userMapper, 'toResponse').mockReturnValue(mockUser as any);

      const result = await userService.remove(mockUser.id, mockPayload);

      expect(userModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(userModel.findByIdAndDelete).toHaveBeenCalledWith(mockUser.id);
      expect(userMapper.toResponse).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(
        userService.remove(mockUser.id, mockPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when user is not authorized', async () => {
      const unauthorizedPayload: PayloadDto = {
        sub: 'different-user-id',
        email: 'different@example.com',
        roles: [Roles.USER],
        iat: 1234567890,
        exp: 1234567890,
        aud: 'test',
        iss: 'test',
      };

      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      await expect(
        userService.remove(mockUser.id, unauthorizedPayload),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findByEmail', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(mockUser);

      const result = await userService.findByEmail(mockUser.email);

      expect(userModel.findOne).toHaveBeenCalledWith({ email: mockUser.email });
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findOne').mockResolvedValue(null);

      await expect(userService.findByEmail(mockUser.email)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);

      const result = await userService.findById(mockUser.id);

      expect(userModel.findById).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(userService.findById(mockUser.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findOneByPayload', () => {
    it('should return a user when found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(mockUser);
      jest.spyOn(userMapper, 'toResponse').mockReturnValue(mockUser as any);

      const result = await userService.findOneByPayload(mockPayload);

      expect(userModel.findById).toHaveBeenCalledWith(mockPayload.sub);
      expect(userMapper.toResponse).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw error when user not found', async () => {
      jest.spyOn(userModel, 'findById').mockResolvedValue(null);

      await expect(userService.findOneByPayload(mockPayload)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
