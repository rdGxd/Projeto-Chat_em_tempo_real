import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UnifiedAuthAndPolicyGuard } from './auth/guards/unified-auth-and-policy.guard';
import { ChatModule } from './chat/chat.module';
import { MessageModule } from './message/message.module';
import { RoomModule } from './room/room.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: `mongodb://${configService.get('DATABASE_USERNAME')}:${configService.get('DATABASE_PASSWORD')}@${configService.get('DATABASE_HOST')}:${configService.get('DATABASE_PORT')}/${configService.get('DATABASE_NAME')}?authSource=admin&retryWrites=true&w=majority`,
      }),
    }),
    UserModule,
    AuthModule,
    RoomModule,
    MessageModule,
    ChatModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UnifiedAuthAndPolicyGuard,
    },
  ],
})
export class AppModule {}
