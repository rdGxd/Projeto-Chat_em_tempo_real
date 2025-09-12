import { Body, Controller, Delete, Get, Param, Patch } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
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
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

@ApiTags('user')
@ApiBearerAuth('JWT-auth')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários',
    description:
      'Retorna uma lista com todos os usuários cadastrados no sistema',
  })
  @ApiOkResponse({
    description: 'Lista de usuários retornada com sucesso',
    type: [ResponseUserDto],
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar usuário por ID',
    description: 'Retorna os dados de um usuário específico pelo seu ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Usuário encontrado com sucesso',
    type: ResponseUserDto,
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  findOne(
    @Param('id') id: string,
    @TokenPayLoadParam() tokenPayload: PayloadDto,
  ) {
    return this.userService.findOne(id, tokenPayload);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar usuário',
    description: 'Atualiza as informações de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Usuário atualizado com sucesso',
    type: ResponseUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Não autorizado a atualizar este usuário',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.userService.update(id, updateUserDto, payload);
  }

  @Patch(':id/password')
  @ApiOperation({
    summary: 'Atualizar senha do usuário',
    description: 'Atualiza a senha de um usuário específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Senha atualizada com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Dados de entrada inválidos ou senha atual incorreta',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Não autorizado a atualizar a senha deste usuário',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  updatePassword(
    @Param('id') id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
    @TokenPayLoadParam() payload: PayloadDto,
  ) {
    return this.userService.updatePassword(id, updatePasswordDto, payload);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Deletar usuário',
    description: 'Remove um usuário do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID do usuário',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @ApiOkResponse({
    description: 'Usuário removido com sucesso',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado',
  })
  @ApiForbiddenResponse({
    description: 'Não autorizado a deletar este usuário',
  })
  @ApiUnauthorizedResponse({
    description: 'Token não fornecido ou inválido',
  })
  remove(@Param('id') id: string, @TokenPayLoadParam() payload: PayloadDto) {
    return this.userService.remove(id, payload);
  }
}
