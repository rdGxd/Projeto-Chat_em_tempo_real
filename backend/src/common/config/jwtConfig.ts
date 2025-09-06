import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: Number(process.env.JWT_EXPIRES_IN ?? '3600'),
    audience: process.env.JWT_AUDIENCE,
    issuer: process.env.JWT_ISSUER,
  },
  refreshToken: Number(process.env.JWT_REFRESH_TOKEN ?? '86400'),
}));
