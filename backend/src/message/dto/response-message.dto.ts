import { Expose, Transform } from 'class-transformer';

export class ResponseMessageDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;

  @Expose()
  content: string;

  @Expose()
  @Transform(({ obj }) => obj.author.toString())
  userId: string;

  @Expose()
  @Transform(({ obj }) => obj.room.toString())
  roomId: string;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: Date;
}
