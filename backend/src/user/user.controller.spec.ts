import { PayloadDto } from '../auth/dto/payload.dto';
import { Roles } from '../common/enums/role';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  const userServiceMock = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(() => {
    controller = new UserController(userServiceMock as unknown as UserService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAll - should call userService', async () => {
    const expected = [{ anyKey: 'anyValue' }];

    jest.spyOn(userServiceMock, 'findAll').mockReturnValue(expected);

    const result = await controller.findAll();
    expect(result).toEqual(expected);
    expect(userServiceMock.findAll).toHaveBeenCalled();
  });

  it('findOne', async () => {
    const expected = { anyKey: 'anyValue' };
    const mockTokenPayloadDto: PayloadDto = {
      sub: 'anyId',
      email: 'test@example.com',
      roles: [Roles.USER],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: 'test-audience',
      iss: 'test-issuer',
    };

    jest.spyOn(userServiceMock, 'findOne').mockReturnValue(expected);

    const result = await controller.findOne('anyId', mockTokenPayloadDto);
    expect(result).toEqual(expected);
    expect(userServiceMock.findOne).toHaveBeenCalledWith(
      'anyId',
      mockTokenPayloadDto,
    );
  });

  it('Update', async () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated Name',
      email: 'updated@example.com',
    };
    const expected = { anyKey: 'anyValue' };
    const mockTokenPayloadDto: PayloadDto = {
      sub: 'user-id',
      email: 'test@example.com',
      roles: [Roles.USER],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: 'test-audience',
      iss: 'test-issuer',
    };

    jest.spyOn(userServiceMock, 'update').mockReturnValue(expected);

    const result = await controller.update(
      'user-id',
      updateUserDto,
      mockTokenPayloadDto,
    );
    expect(result).toEqual(expected);
    expect(userServiceMock.update).toHaveBeenCalledWith(
      'user-id',
      updateUserDto,
      mockTokenPayloadDto,
    );
  });

  it('Remove', async () => {
    const expected = { anyKey: 'anyValue' };
    const mockTokenPayloadDto: PayloadDto = {
      sub: 'user-id',
      email: 'test@example.com',
      roles: [Roles.USER],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      aud: 'test-audience',
      iss: 'test-issuer',
    };

    jest.spyOn(userServiceMock, 'remove').mockReturnValue(expected);

    const result = await controller.remove('user-id', mockTokenPayloadDto);
    expect(result).toEqual(expected);
    expect(userServiceMock.remove).toHaveBeenCalledWith(
      'user-id',
      mockTokenPayloadDto,
    );
  });
});
