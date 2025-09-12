import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class ResponseMessageDto {
  @ApiProperty({
    description: 'ID da mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b8',
  })
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá, como vocês estão?',
  })
  @Expose()
  content: string;

  @ApiProperty({
    description: 'ID do usuário que enviou a mensagem',
    example: '64a7b2f5e1b2c3d4e5f6a7b9',
  })
  @Expose()
  @Transform(({ obj }) => obj.author.toString())
  userId: string;

  @ApiProperty({
    description: 'ID da sala onde a mensagem foi enviada',
    example: '64a7b2f5e1b2c3d4e5f6a7ba',
  })
  @Expose()
  @Transform(({ obj }) => obj.room.toString())
  roomId: string;

  @ApiProperty({
    description: 'Data e hora de criação da mensagem',
    example: '2023-07-01T12:34:56.789Z',
  })
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @ApiProperty({
    description: 'Data e hora da última atualização da mensagem',
    example: '2023-07-10T09:08:07.654Z',
  })
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
}
