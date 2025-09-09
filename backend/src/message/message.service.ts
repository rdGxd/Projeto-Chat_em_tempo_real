import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { RoomService } from 'src/room/room.service';
import { UserService } from 'src/user/user.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageDocument } from './entities/message.entity';
import { MessageMapper } from './mapper/message-mapper';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private readonly messageModel: Model<MessageDocument>,
    private readonly messageMapper: MessageMapper,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}

  async create(createMessageDto: CreateMessageDto, payload: PayloadDto) {
    const user = await this.userService.findById(payload.sub);
    const room = await this.roomService.findOne(createMessageDto.room);

    if (!user || !room) {
      throw new Error('User or Room not found');
    }

    // Cria a mensagem
    const newMessage = this.messageMapper.toEntity(
      createMessageDto,
      user._id.toString(),
    );
    const createdMessage = await this.messageModel.create(newMessage);

    // Adiciona a mensagem na sala
    await this.roomService.updateMessages(
      room.id.toString(),
      createdMessage._id,
    );

    // Retorna a mensagem populada
    const populatedMessage = await this.messageModel
      .findById(createdMessage._id)
      .populate('author', 'name email'); // só retorna info necessária

    if (!populatedMessage) return;

    return this.messageMapper.toResponse(populatedMessage);
  }

  async findAll(id: string) {
    const messages = await this.messageModel
      .find({ room: id })
      .populate('author', 'name email');
    return messages.map((message) => this.messageMapper.toResponse(message));
  }

  async findOne(id: string, payload: PayloadDto) {
    const populatedMessage = await this.verifyMessageOwnership(id, payload.sub);
    return this.messageMapper.toResponse(populatedMessage);
  }

  async update(
    id: string,
    updateMessageDto: UpdateMessageDto,
    payload: PayloadDto,
  ) {
    const message = await this.verifyMessageOwnership(id, payload.sub);
    await this.messageModel
      .findByIdAndUpdate(id, updateMessageDto, { new: true })
      .populate('author', 'name email');
    return this.messageMapper.toResponse(message);
  }

  async remove(id: string, payload: PayloadDto) {
    const message = await this.verifyMessageOwnership(id, payload.sub);
    await this.messageModel.findByIdAndDelete(id);
    return this.messageMapper.toResponse(message);
  }

  private async verifyMessageOwnership(messageId: string, userId: string) {
    const message = await this.messageModel
      .findById(messageId)
      .populate('author', 'name email');
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (message.author.toString() !== userId) {
      throw new Error('You are not allowed to delete this message');
    }
    return message;
  }
}
