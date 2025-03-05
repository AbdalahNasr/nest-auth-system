/* eslint-disable prettier/prettier */
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string; // Reset token from email

  @MinLength(6)
  newPassword: string; // New password must be at least 6 characters
}
