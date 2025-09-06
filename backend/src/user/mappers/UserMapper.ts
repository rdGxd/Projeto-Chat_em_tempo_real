import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../dto/create-user.dto';
import { ResponseUserDto } from '../dto/response-user.dto';
import { User } from '../entities/user.entity';
import { UserStatus } from '../enum/UserStatus';

@Injectable()
export class UserMapper {
  toEntity(dto: CreateUserDto) {
    return plainToInstance(User, {
      ...dto,
      status: UserStatus.OFFLINE,
    });
  }

  toResponse(user: User): ResponseUserDto {
    return plainToInstance(ResponseUserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
