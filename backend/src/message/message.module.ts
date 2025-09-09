import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoomModule } from 'src/room/room.module';
import { UserModule } from 'src/user/user.module';
import { MessageSchema } from './entities/message.entity';
import { MessageMapper } from './mapper/message-mapper';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Message', schema: MessageSchema }]),
    RoomModule,
    UserModule,
  ],
  controllers: [MessageController],
  providers: [MessageService, MessageMapper],
  exports: [MessageService],
})
export class MessageModule {}
