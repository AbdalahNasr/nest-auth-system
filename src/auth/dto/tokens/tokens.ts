/* eslint-disable prettier/prettier */
import { IsString, IsNotEmpty } from 'class-validator';

export class Tokens {
    @IsString({ message: 'Access token must be a string' })
    @IsNotEmpty({ message: 'Access token is required' })
    accessToken!: string;

    @IsString({ message: 'Refresh token must be a string' })
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken!: string;
}
