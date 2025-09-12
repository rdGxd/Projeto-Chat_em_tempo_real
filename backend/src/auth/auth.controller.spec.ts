import { Roles } from 'src/common/enums/role';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PayloadDto } from './dto/payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { ResponseTokenDto } from './dto/response-token.dto';

describe('AuthController', () => {
  let controller: AuthController;
  const authServiceMock: Partial<AuthService> = {
    login: jest.fn(),
    register: jest.fn(),
    getProfile: jest.fn(),
    refreshTokens: jest.fn(),
  };

  beforeEach(() => {
    controller = new AuthController({ ...authServiceMock } as AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.login with correct parameters', async () => {
    const loginDto: LoginAuthDto = {
      email: 'test@teste.com',
      password: 'test',
    };
    await controller.login(loginDto);
    expect(authServiceMock.login).toHaveBeenCalledWith(loginDto);
  });

  it('should call authService.register with correct parameters', async () => {
    const registerDto: RegisterUserDto = {
      email: 'test@teste.com',
      password: 'test',
      name: 'Test User',
    };
    await controller.register(registerDto);
    expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);
  });

  it('should call authService.getProfile with correct parameters', async () => {
    const tokenPayload: PayloadDto = {
      sub: 'user-id',
      email: 'test@teste.com',
      roles: [Roles.USER],
      iat: 1234567890,
      exp: 1234567890,
      aud: 'test',
      iss: 'test',
    };
    await controller.getProfile(tokenPayload);
    expect(authServiceMock.getProfile).toHaveBeenCalledWith(tokenPayload);
  });

  it('should call authService.refresh with correct parameters', async () => {
    const refreshTokenDto: RefreshTokenDto = {
      refreshToken: 'refresh-token',
    };
    const accessToken = process.env.TEST_ACCESS_TOKEN;
    const mockResult = { accessToken, refreshToken: 'any' };
    jest
      .spyOn(authServiceMock, 'refreshTokens')
      .mockResolvedValue(mockResult as ResponseTokenDto);

    const result = await controller.refresh(refreshTokenDto);

    expect(authServiceMock.refreshTokens).toHaveBeenCalledWith(refreshTokenDto);
    expect(result).toEqual(mockResult);
  });
});
