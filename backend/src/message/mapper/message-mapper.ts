import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { Types } from 'mongoose';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ResponseMessageDto } from '../dto/response-message.dto';
import { Message } from '../entities/message.entity';

@Injectable()
export class MessageMapper {
  toEntity(dto: CreateMessageDto, userId: string): Partial<Message> {
    return {
      content: dto.content,
      author: new Types.ObjectId(userId),
      room: new Types.ObjectId(dto.room),
    };
  }

  toResponse(message: Message): ResponseMessageDto {
    return plainToInstance(ResponseMessageDto, message, {
      excludeExtraneousValues: true,
    });
  }
}
