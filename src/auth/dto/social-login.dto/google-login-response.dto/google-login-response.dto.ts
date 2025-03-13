/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { User } from '../../../../users/entities/user.entity';

export class GoogleLoginResponseDto {
    @IsNotEmpty({ message: 'User object is required' })
    user!: User;

    @IsString({ message: 'Access token must be a string' })
    @IsNotEmpty({ message: 'Access token is required' })
    accessToken!: string;

    @IsString({ message: 'Message must be a string' })
    @IsOptional()
    message?: string;
}