import { Expose, Transform } from 'class-transformer';
import { UserStatus } from '../enum/UserStatus';

export class ResponseUserDto {
  @Expose()
  @Transform(({ obj }) => obj._id.toString())
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  status: UserStatus;
  @Expose()
  @Transform(({ value }) => value.toISOString())
  createdAt: string;
  @Expose()
  @Transform(({ value }) => value.toISOString())
  updatedAt: string;
  @Expose()
  roles: string[];
}
