import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Roles } from 'src/common/enums/role';
import { UserStatus } from '../enum/UserStatus';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  _id: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserStatus })
  status: UserStatus;

  @Prop({
    type: [String], // tipo dos elementos do array
    enum: Roles, // enum válido
    default: [Roles.USER],
  })
  roles: Roles[];

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
