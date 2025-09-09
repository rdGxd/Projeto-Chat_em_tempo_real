import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './entities/room.entity';
import { RoomMapper } from './mapper/room-mapper';
import { RoomController } from './room.controller';
import { RoomService } from './room.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Room.name, schema: RoomSchema }]),
  ],
  controllers: [RoomController],
  providers: [RoomService, RoomMapper],
  exports: [RoomService],
})
export class RoomModule {}
