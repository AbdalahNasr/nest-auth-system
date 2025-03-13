/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @IsString({ message: 'Login must be a string' })
    @IsNotEmpty({ message: 'Login is required' })
    @MinLength(3, { message: 'Login must be at least 3 characters' })
    login!: string;  // Accepts username, email, or phone

    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    password!: string;
}
