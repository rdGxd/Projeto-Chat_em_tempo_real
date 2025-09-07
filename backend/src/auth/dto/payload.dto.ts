import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Roles } from 'src/common/enums/role';

export class PayloadDto {
  @IsString()
  @IsNotEmpty({ message: 'Subject is required' })
  sub: string;
  @IsString()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;
  @IsEnum(Roles, { each: true })
  @IsNotEmpty({ message: 'Roles are required' })
  roles: Roles[];
  @IsNumber()
  @IsNotEmpty({ message: 'Issued at is required' })
  iat: number;
  @IsNumber()
  @IsNotEmpty({ message: 'Expiration is required' })
  exp: number;
  @IsString()
  @IsNotEmpty({ message: 'Audience is required' })
  aud: string;
  @IsString()
  @IsNotEmpty({ message: 'Issuer is required' })
  iss: string;
}
