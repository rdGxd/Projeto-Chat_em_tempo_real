import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { CreateRoomDto } from '../dto/create-room.dto';
import { ResponseRoomDto } from '../dto/response-room.dto';
import { Room } from '../entities/room.entity';

@Injectable()
export class RoomMapper {
  toResponse(room: any): ResponseRoomDto {
    const dto = new ResponseRoomDto();

    dto.id = room._id.toString();
    dto.name = room.name;
    dto.users = room.users.map((user: any) => ({
      id: user._id?.toString(),
      name: user.name,
      email: user.email,
    }));
    dto.owner = {
      id: room.owner._id?.toString(),
      name: room.owner.name,
      email: room.owner.email,
    };
    dto.messages = room.messages.map((msg: any) => ({
      id: msg._id?.toString(),
      content: msg.content,
      author: msg.author
        ? {
            id: msg.author._id?.toString(),
            name: msg.author.name,
            email: msg.author.email,
          }
        : undefined,
      createdAt: msg.createdAt?.toISOString(),
      updatedAt: msg.updatedAt?.toISOString(),
    }));
    dto.createdAt = room.createdAt?.toISOString();
    dto.updatedAt = room.updatedAt?.toISOString();

    return dto;
  }

  toEntity(roomDTO: CreateRoomDto, idUser: string): Partial<Room> {
    return {
      name: roomDTO.name,
      users: [new Types.ObjectId(idUser)],
      messages: [],
      owner: new Types.ObjectId(idUser),
    };
  }
}
