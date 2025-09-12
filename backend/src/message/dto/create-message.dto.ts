import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateMessageDto {
  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, como vocês estão?',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'ID da sala onde a mensagem será enviada',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @IsMongoId()
  @IsNotEmpty()
  room: string;
}
