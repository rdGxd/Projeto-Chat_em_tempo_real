import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseTokenDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  accessToken: string;

  @ApiProperty({
    description: 'Token de refresh para renovar o access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @Expose()
  refreshToken: string;

  @ApiProperty({
    description: 'Tempo de expiração do access token em segundos',
    example: 3600,
  })
  @Expose()
  expiresIn: number;

  @ApiProperty({
    description: 'Tempo de expiração do refresh token em segundos',
    example: 604800,
  })
  @Expose()
  refreshTokenExpiresIn: number;
}
