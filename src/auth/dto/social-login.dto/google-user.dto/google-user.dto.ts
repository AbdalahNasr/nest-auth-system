/* eslint-disable prettier/prettier */
import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class GoogleUserDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email!: string;

    @IsString({ message: 'Display name must be a string' })
    @IsNotEmpty({ message: 'Display name is required' })
    displayName!: string;

    @IsString({ message: 'Phone number must be a string' })
    phoneNumber?: string;
}