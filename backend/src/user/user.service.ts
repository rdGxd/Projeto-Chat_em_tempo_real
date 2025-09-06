import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HashingProtocol } from 'src/common/HashingPassowrd/HashingProtocol';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { UserMapper } from './mappers/UserMapper';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userMapper: UserMapper,
    private readonly hashingService: HashingProtocol,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userMapper.toEntity(createUserDto);
    user.password = await this.hashingService.hash(createUserDto.password);
    const createdUser = await this.userModel.create(user);
    return this.userMapper.toResponse(createdUser);
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  // NOTE: Método apenas para uso da aplicação
  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // NOTE: Método apenas para uso da aplicação
  findById(id: string) {
    return this.userModel.findById(id);
  }
}
