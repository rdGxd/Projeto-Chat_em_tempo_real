import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import { UserStatus } from '../enum/UserStatus';

export class ResponseUserDto {
  @Expose()
  @ApiProperty({ description: 'User ID', example: '64a7b2f5e1b2c3d4e5f6a7b8' })
  @Transform(({ obj }) => obj._id.toString())
  id: string;
  @Expose()
  @ApiProperty({ description: 'User name', example: 'John Doe' })
  name: string;
  @Expose()
  @ApiProperty({ description: 'User email', example: 'john.doe@example.com' })
  email: string;
  @Expose()
  @ApiProperty({ description: 'User status', example: 'active' })
  status: UserStatus;
  @Expose()
  @ApiProperty({
    description: 'Account creation date',
    example: '2023-07-01T12:34:56.789Z',
  })
  @Transform(({ value }) => value.toISOString())
  createdAt: string;
  @Expose()
  @ApiProperty({
    description: 'Last account update date',
    example: '2023-07-10T09:08:07.654Z',
  })
  @Transform(({ value }) => value.toISOString())
  updatedAt: string;

  @Expose()
  @ApiProperty({ description: 'User roles', example: ['user', 'admin'] })
  roles: string[];
}
