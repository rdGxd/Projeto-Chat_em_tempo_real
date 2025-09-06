import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HashingModule } from 'src/common/HashingPassowrd/hashing.module';
import { User, UserSchema } from './entities/user.entity';
import { UserMapper } from './mappers/UserMapper';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    HashingModule,
  ],
  controllers: [UserController],
  providers: [UserService, UserMapper],
  exports: [UserService],
})
export class UserModule {}
