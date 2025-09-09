import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(
    @Body() createMessageDto: CreateMessageDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.messageService.create(createMessageDto, payload);
  }

  @Get()
  findAll(@TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.findAll(payload.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.findOne(id, payload);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.messageService.update(id, updateMessageDto, payload);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.remove(id, payload);
  }
}
