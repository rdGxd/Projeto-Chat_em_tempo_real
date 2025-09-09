import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type RoomDocument = HydratedDocument<Room>;

@Schema({ timestamps: true })
export class Room {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  // lista de usuários (referência para User)
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] })
  users: Types.ObjectId[];

  // lista de mensagens (One-to-Many)
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] })
  messages: Types.ObjectId[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  owner: Types.ObjectId;

  createdAt: Date;

  updatedAt: Date;
}

export const RoomSchema = SchemaFactory.createForClass(Room);
