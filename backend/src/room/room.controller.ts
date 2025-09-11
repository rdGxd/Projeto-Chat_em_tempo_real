import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { Public } from 'src/auth/decorators/set-is-public-policy.decorator';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomService } from './room.service';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(
    @Body() createRoomDto: CreateRoomDto,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.roomService.create(createRoomDto, tokenPayload);
  }

  @Get()
  @Public()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TokenPayLoadParam() tokenPayload: any) {
    return this.roomService.remove(id, tokenPayload);
  }

  @Post('leave/:id')
  leave(
    @Param('id') id: string,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.roomService.leaveTheRoom(id, tokenPayload);
  }

  @Post('join/:id')
  join(@Param('id') id: string, @TokenPayLoadParam() tokenPayload: PayloadDto) {
    return this.roomService.enterTheRoom(id, tokenPayload);
  }
}
