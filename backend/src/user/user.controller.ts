import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.userService.update(id, updateUserDto, payload);
  }

  @Patch(':id')
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.userService.remove(id, payload);
  }
}
