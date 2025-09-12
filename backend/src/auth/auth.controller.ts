import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { ResponseUserDto } from 'src/user/dto/response-user.dto';
import { AuthService } from './auth.service';
import { Public } from './decorators/set-is-public-policy.decorator';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PayloadDto } from './dto/payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResponseTokenDto } from './dto/response-token.dto';

@ApiTags('auth')
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Fazer login',
    description: 'Autentica um usuário e retorna tokens de acesso e refresh',
  })
  @ApiOkResponse({
    description: 'Login realizado com sucesso',
    type: ResponseTokenDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas',
  })
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar usuário',
    description: 'Cria uma nova conta de usuário no sistema',
  })
  @ApiCreatedResponse({
    description: 'Usuário criado com sucesso',
    type: ResponseUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos ou email já existe',
  })
  register(@Body() registerAuthDto: RegisterUserDto) {
    return this.authService.register(registerAuthDto);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter perfil do usuário',
    description: 'Retorna as informações do perfil do usuário autenticado',
  })
  @ApiOkResponse({
    description: 'Perfil do usuário retornado com sucesso',
    type: ResponseUserDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  getProfile(@TokenPayLoadParam() tokenPayload: PayloadDto) {
    return this.authService.getProfile(tokenPayload);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Renovar tokens',
    description: 'Usa o refresh token para obter novos tokens de acesso',
  })
  @ApiOkResponse({
    description: 'Tokens renovados com sucesso',
    type: ResponseTokenDto,
  })
  @ApiBadRequestResponse({
    description: 'Refresh token inválido',
  })
  @ApiUnauthorizedResponse({
    description: 'Refresh token expirado ou inválido',
  })
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
