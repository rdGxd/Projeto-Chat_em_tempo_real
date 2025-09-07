import {
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwtConfig';
import { HashingProtocol } from 'src/common/HashingPassword/HashingProtocol';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { LoginAuthDto } from './dto/login-auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthMapper } from './mapper/auth-mapper';

@Injectable()
export class AuthService {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly userService: UserService,
    private readonly hashingService: HashingProtocol,
    private readonly jwtService: JwtService,
    private readonly authMapper: AuthMapper,
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

    return this.createToken(user._id.toString());
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

      const newTokens = await this.createToken(user._id.toString());
      return newTokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async createToken(userId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.signJwtAsync(userId, this.jwtConfiguration.signOptions.expiresIn),
      this.signJwtAsync(userId, this.jwtConfiguration.refreshToken),
    ]);

    return this.authMapper.toDto({
      accessToken,
      refreshToken,
      expiresIn: Number(this.jwtConfiguration.signOptions.expiresIn),
      refreshTokenExpiresIn: Number(this.jwtConfiguration.refreshToken),
    });
  }

  private async signJwtAsync(
    sub: string,
    expiresIn: number,
    payload?: Partial<User>,
  ) {
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
