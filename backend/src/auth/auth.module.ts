import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from 'src/common/config/jwtConfig';
import { HashingModule } from 'src/common/HashingPassowrd/hashing.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthAndPolicyGuard } from './guards/auth-and-policy.guard';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesGuard, AuthGuard, AuthAndPolicyGuard],
  imports: [
    UserModule,
    HashingModule,
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  exports: [AuthService, JwtModule, AuthGuard, RolesGuard, AuthAndPolicyGuard],
})
export class AuthModule {}
