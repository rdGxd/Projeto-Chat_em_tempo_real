import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { HashingProtocol } from 'src/common/HashingPassword/HashingProtocol';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
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

  async create(createUserDto: RegisterUserDto) {
    const user = this.userMapper.toEntity(createUserDto);
    user.password = await this.hashingService.hash(createUserDto.password);
    const createdUser = await this.userModel.create(user);
    return this.userMapper.toResponse(createdUser);
  }

  async findAll() {
    const users = await this.userModel.find();
    return users.map((user) => this.userMapper.toResponse(user));
  }

  async findOne(id: string) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.userMapper.toResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto, payload: PayloadDto) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (payload.sub !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    const updatedUser = await this.userModel.findByIdAndUpdate(
      { _id: id },
      updateUserDto,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!updatedUser) return;

    return this.userMapper.toResponse(updatedUser);
  }

  async updatePassword(
    id: string,
    updatePasswordDto: UpdatePasswordDto,
    payload: PayloadDto,
  ) {
    const user = await this.findById(id);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    if (payload.sub !== id) {
      throw new UnauthorizedException('You can only update your own profile');
    }

    const isValid = await this.hashingService.compare(
      updatePasswordDto.oldPassword,
      user.password,
    );
    if (!isValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = await this.hashingService.hash(
      updatePasswordDto.newPassword,
    );

    await user.save();
    return this.userMapper.toResponse(user);
  }

  async remove(id: string, payload: PayloadDto) {
    const user = await this.findById(id);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (payload.sub !== id) {
      throw new UnauthorizedException('You can only delete your own account');
    }

    const deletedUser = await this.userModel.findByIdAndDelete(id);

    if (!deletedUser) return;

    return this.userMapper.toResponse(deletedUser);
  }

  // NOTE: Método apenas para uso da aplicação
  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  // NOTE: Método apenas para uso da aplicação
  findById(id: string) {
    return this.userModel.findById(id);
  }

  // NOTE: Método apenas para uso da aplicação
  async findOneByPayload(payload: PayloadDto) {
    const user = await this.userModel.findById(payload.sub);
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.userMapper.toResponse(user);
  }
}
