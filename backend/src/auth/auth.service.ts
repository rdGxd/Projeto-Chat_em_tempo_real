import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwtConfig';
import { HashingProtocol } from 'src/common/HashingPassowrd/HashingProtocol';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
    private readonly hashingService: HashingProtocol,
    private readonly jwtService: JwtService,
  ) {}

  async login(login: LoginAuthDto) {
    const user = await this.userService.findByEmail(login.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isValid = await this.hashingService.compare(
      login.password,
      user.password,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.createToken(user);
  }

  async createToken(user: User) {
    const accessTokenPromise = this.signJwtAsync<Partial<User>>(
      user._id.toString(),
      this.jwtConfiguration.signOptions.expiresIn,
    );

    const refreshTokenPromise = this.signJwtAsync(
      user._id.toString(),
      this.jwtConfiguration.refreshToken,
    );

    const [accessToken, refreshToken] = await Promise.all([
      accessTokenPromise,
      refreshTokenPromise,
    ]);
    console.log(accessTokenPromise, refreshTokenPromise);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.jwtConfiguration.signOptions.expiresIn,
      refreshTokenExpiresIn: this.jwtConfiguration.refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        {
          secret: this.jwtConfiguration.secret,
          audience: this.jwtConfiguration.signOptions.audience,
          issuer: this.jwtConfiguration.signOptions.issuer,
        },
      );

      const user = await this.userService.findById(sub);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      const newTokens = await this.createToken(user);
      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async signJwtAsync<T>(sub: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.signOptions.audience,
        issuer: this.jwtConfiguration.signOptions.issuer,
        expiresIn,
      },
    );
  }
}
