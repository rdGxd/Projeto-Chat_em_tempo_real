import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
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
import { Public } from 'src/auth/decorators/set-is-public-policy.decorator';
import { PayloadDto } from 'src/auth/dto/payload.dto';
import { TokenPayLoadParam } from 'src/common/decorators/token-payload.decorator';
import { CreateRoomDto } from './dto/create-room.dto';
import { ResponseRoomDto } from './dto/response-room.dto';
import { RoomService } from './room.service';

@ApiTags('room')
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Criar sala',
    description: 'Cria uma nova sala de chat',
  })
  @ApiCreatedResponse({
    description: 'Sala criada com sucesso',
    type: ResponseRoomDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  create(
    @Body() createRoomDto: CreateRoomDto,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.roomService.create(createRoomDto, tokenPayload);
  }

  @Get()
  @Public()
  @ApiOperation({
    summary: 'Listar salas',
    description: 'Retorna uma lista com todas as salas de chat disponíveis',
  })
  @ApiOkResponse({
    description: 'Lista de salas retornada com sucesso',
    type: [ResponseRoomDto],
  })
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({
    summary: 'Buscar sala por ID',
    description:
      'Retorna os detalhes de uma sala específica incluindo mensagens e usuários',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sala',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Sala encontrada com sucesso',
    type: ResponseRoomDto,
  })
  @ApiNotFoundResponse({
    description: 'Sala não encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.roomService.findOne(id);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Deletar sala',
    description:
      'Remove uma sala do sistema (apenas o proprietário pode fazer isso)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sala',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Sala removida com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Sala não encontrada',
  })
  @ApiForbiddenResponse({
    description: 'Usuário não tem permissão para deletar esta sala',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  remove(
    @Param('id') id: string,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.roomService.remove(id, tokenPayload);
  }

  @Post('leave/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Sair da sala',
    description: 'Remove o usuário autenticado de uma sala específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sala',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Usuário saiu da sala com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Sala não encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Usuário não está na sala',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  leave(
    @Param('id') id: string,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.roomService.leaveTheRoom(id, tokenPayload);
  }

  @Post('join/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Entrar na sala',
    description: 'Adiciona o usuário autenticado a uma sala específica',
  })
  @ApiParam({
    name: 'id',
    description: 'ID da sala',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Usuário entrou na sala com sucesso',
    type: ResponseRoomDto,
  })
  @ApiNotFoundResponse({
    description: 'Sala não encontrada',
  })
  @ApiBadRequestResponse({
    description: 'Usuário já está na sala',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  join(@Param('id') id: string, @TokenPayLoadParam() tokenPayload: PayloadDto) {
    return this.roomService.enterTheRoom(id, tokenPayload);
  }
}
