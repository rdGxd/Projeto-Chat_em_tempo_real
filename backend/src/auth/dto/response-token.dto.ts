import { Expose } from 'class-transformer';

export class ResponseTokenDto {
  @Expose()
  accessToken: string;
  @Expose()
  refreshToken: string;
  @Expose()
  expiresIn: number;
  @Expose()
  refreshTokenExpiresIn: number;
}
