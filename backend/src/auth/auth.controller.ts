import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { AuthService } from './auth.service';
import { Public } from './decorators/set-is-public-policy.decorator';
import { LoginAuthDto } from './dto/login-auth.dto';
import { PayloadDto } from './dto/payload.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.login(loginAuthDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  register(@Body() registerAuthDto: RegisterUserDto) {
    return this.authService.register(registerAuthDto);
  }

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  getProfile(@TokenPayLoadParam() tokenPayload: PayloadDto) {
    return this.authService.getProfile(tokenPayload);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }
}
