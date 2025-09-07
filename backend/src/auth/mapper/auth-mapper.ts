import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ResponseTokenDto } from '../dto/response-token.dto';

@Injectable()
export class AuthMapper {
  toDto(dto: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    refreshTokenExpiresIn: number;
  }) {
    return plainToInstance(ResponseTokenDto, dto, {
      excludeExtraneousValues: true
    });
  }
}
