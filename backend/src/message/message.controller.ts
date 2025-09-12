import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateMessageDto } from './dto/create-message.dto';
import { ResponseMessageDto } from './dto/response-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageService } from './message.service';

@ApiTags('message')
@ApiBearerAuth('JWT-auth')
@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @ApiOperation({
    summary: 'Criar mensagem',
    description: 'Cria uma nova mensagem em uma sala específica',
  })
  @ApiCreatedResponse({
    description: 'Mensagem criada com sucesso',
    type: ResponseMessageDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos ou sala não encontrada',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para enviar mensagens nesta sala',
  })
  create(
    @Body() createMessageDto: CreateMessageDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.messageService.create(createMessageDto, payload);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar mensagens do usuário',
    description:
      'Retorna todas as mensagens relacionadas ao usuário autenticado',
  })
  @ApiOkResponse({
    description: 'Lista de mensagens retornada com sucesso',
    type: [ResponseMessageDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  findAll(@TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.findAll(payload.sub);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar mensagem por ID',
    description: 'Retorna uma mensagem específica pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Mensagem encontrada com sucesso',
    type: ResponseMessageDto,
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para ver esta mensagem',
  })
  findOne(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.findOne(id, payload);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar mensagem',
    description: 'Atualiza o conteúdo de uma mensagem específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Mensagem atualizada com sucesso',
    type: ResponseMessageDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para atualizar esta mensagem',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  update(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.messageService.update(id, updateMessageDto, payload);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar mensagem',
    description: 'Remove uma mensagem do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Mensagem removida com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Mensagem não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para deletar esta mensagem',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  remove(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.messageService.remove(id, payload);
  }
}
