import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { RegisterUserDto } from '../../auth/dto/register-user.dto';
import { ResponseUserDto } from '../dto/response-user.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UserMapper {
  toEntity(dto: RegisterUserDto): Partial<User> {
    return {
      name: dto.name,
      email: dto.email,
      password: dto.password,
    };
  }

  toResponse(user: User): ResponseUserDto {
    return plainToInstance(ResponseUserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
