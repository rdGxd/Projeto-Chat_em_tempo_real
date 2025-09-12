import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'ID do usuário',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Doe',
  })
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
    required: false,
  })
  email?: string;
}

export class MessageDto {
  @ApiProperty({
    description: 'ID da mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b9',
  })
  id: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, pessoal!',
  })
  content: string;

  @ApiProperty({
    description: 'Autor da mensagem',
    type: UserDto,
    required: false,
  })
  author?: UserDto;

  @ApiProperty({
    description: 'Data e hora de criação da mensagem',
    example: '2023-07-01T12:34:56.789Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data e hora da última atualização da mensagem',
    example: '2023-07-10T09:08:07.654Z',
  })
  updatedAt: string;
}

export class ResponseRoomDto {
  @ApiProperty({
    description: 'ID da sala',
    example: '64a7b2f5e1b2c3d4e5f6a7ba',
  })
  id: string;

  @ApiProperty({
    description: 'Nome da sala',
    example: 'Sala de Desenvolvimento',
  })
  name: string;

  @ApiProperty({
    description: 'Lista de usuários na sala',
    type: [UserDto],
  })
  users: UserDto[];

  @ApiProperty({
    description: 'Proprietário da sala',
    type: UserDto,
  })
  owner: UserDto;

  @ApiProperty({
    description: 'Lista de mensagens da sala',
    type: [MessageDto],
  })
  messages: MessageDto[];

  @ApiProperty({
    description: 'Data e hora de criação da sala',
    example: '2023-07-01T12:34:56.789Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Data e hora da última atualização da sala',
    example: '2023-07-10T09:08:07.654Z',
  })
  updatedAt: string;
}
