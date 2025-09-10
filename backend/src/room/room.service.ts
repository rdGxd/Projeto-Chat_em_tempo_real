import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { Room, RoomDocument } from './entities/room.entity';
import { RoomMapper } from './mapper/room-mapper';

@Injectable()
export class RoomService {
  constructor(
    @InjectModel(Room.name) private readonly roomModel: Model<RoomDocument>,
    private readonly roomMapper: RoomMapper,
  ) {}

  async create(createRoomDto: CreateRoomDto, payload: PayloadDto) {
    const room = this.roomMapper.toEntity(createRoomDto, payload.sub);
    const savedRoom = await this.roomModel.create(room);
    return this.roomMapper.toResponse(savedRoom);
  }

  async findAll() {
    const rooms = await this.roomModel
      .find()
      .populate('users', 'name email')
      .populate({
        path: 'messages',
        populate: { path: 'author', select: 'name email' },
      });

    if (!rooms) throw new NotFoundException('Room not found');

    return rooms.map((room: Room) => this.roomMapper.toResponse(room));
  }

  async findOne(id: string) {
    const room = await this.roomModel
      .findById(id)
      .populate('users', 'name email') // pega só nome e email
      .populate({
        path: 'messages',
        populate: { path: 'author', select: 'name email' },
      })
      .populate('owner', 'name email'); // opcional: popula dono da sala

    if (!room) throw new NotFoundException('Room not found');

    return this.roomMapper.toResponse(room);
  }

  async remove(id: string, payload: PayloadDto) {
    const room = await this.roomModel.findById(id);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.owner.toString() !== payload.sub) {
      throw new ForbiddenException('You are not allowed to delete this room');
    }

    await this.roomModel.findByIdAndDelete(id);
  }

  async enterTheRoom(roomId: string, payload: PayloadDto) {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (room.users.includes(new Types.ObjectId(payload.sub))) {
      throw new ForbiddenException('User is already in the room');
    }

    room.users.push(new Types.ObjectId(payload.sub));
    await room.save();

    return this.roomMapper.toResponse(room);
  }

  async leaveTheRoom(roomId: string, payload: PayloadDto) {
    const room = await this.roomModel.findById(roomId);
    if (!room) {
      throw new NotFoundException('Room not found');
    }

    if (!room.users.includes(new Types.ObjectId(payload.sub))) {
      throw new ForbiddenException('User is not in the room');
    }

    room.users = room.users.filter(
      (userId: Types.ObjectId) => !userId.equals(payload.sub),
    );
    await room.save();

    return this.roomMapper.toResponse(room);
  }

  // NOTE: Método sendo utilizado no MessageService
  async updateMessages(roomId: string, messageId: Types.ObjectId) {
    return await this.roomModel.findByIdAndUpdate(
      roomId,
      { $push: { messages: messageId } },
      { new: true }, // retorna o documento atualizado se precisar
    );
  }

  async getUsersInRoom(roomId: string) {
    const room = await this.roomModel
      .findById(roomId)
      .populate('users', 'name email')
      .lean();

    if (!room) throw new NotFoundException('Room not found');

    return room.users;
  }

  getMessagesForRoom(roomId: string) {
    return this.roomModel.findById(roomId).populate('messages').lean();
  }
}
