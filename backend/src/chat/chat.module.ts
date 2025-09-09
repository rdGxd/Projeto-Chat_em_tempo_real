import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'src/auth/auth.module';
import jwtConfig from 'src/common/config/jwtConfig';
import { MessageModule } from '../message/message.module';
import { RoomModule } from '../room/room.module';
import { UserModule } from '../user/user.module';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    MessageModule,
    RoomModule,
    UserModule,
    AuthModule,
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [ChatGateway],
})
export class ChatModule {}
