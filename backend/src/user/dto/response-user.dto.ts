import { Expose } from 'class-transformer';
import { UserStatus } from '../enum/UserStatus';

export class ResponseUserDto {
  @Expose()
  id: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  status: UserStatus;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}
