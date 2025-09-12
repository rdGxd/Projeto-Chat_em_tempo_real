import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'Nome da sala de chat',
    example: 'Sala de Desenvolvimento',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
