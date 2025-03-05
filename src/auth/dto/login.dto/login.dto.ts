/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;  // Accepts username, email, or phone


  @IsNotEmpty()
  password: string;
}
