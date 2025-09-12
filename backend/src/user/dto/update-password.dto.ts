import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'Current password', example: 'oldPassword123' })
  oldPassword: string;

  @IsString()
  @MinLength(6)
  @ApiProperty({ description: 'New password', example: 'newPassword456' })
  newPassword: string;
}
