import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginAuthDto {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
