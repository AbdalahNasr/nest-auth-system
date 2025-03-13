/* eslint-disable prettier/prettier */
import { IsString, MinLength, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Match } from '../../../common/decorators/match.decorator';

export class ResetPasswordDto {
    @ApiProperty({
        description: 'Reset token received via email',
        example: 'abc123def456...',
        minLength: 32
    })
    @IsString({ message: 'Token must be a string' })
    @IsNotEmpty({ message: 'Token is required' })
    @MinLength(32, { message: 'Invalid token length' })
    token!: string;

    @ApiProperty({
        description: 'New password (min 8 chars, must include numbers and special chars)',
        example: 'StrongP@ss123',
        minLength: 8,
        pattern: '^(?=.*[A-Za-z])(?=.*\\d)(?=.*[@$!%*#?&])[A-Za-z\\d@$!%*#?&]{8,}$'
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(
        /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        {
            message: 'Password must contain at least one letter, one number and one special character'
        }
    )
    newPassword!: string;

    @ApiProperty({
        description: 'Confirm the new password',
        example: 'StrongP@ss123',
        minLength: 8
    })
    @IsString({ message: 'Confirmation password must be a string' })
    @IsNotEmpty({ message: 'Confirmation password is required' })
    @MinLength(8, { message: 'Confirmation password must be at least 8 characters long' })
    @Match('newPassword', { message: 'Passwords do not match' })
    confirmPassword!: string;
}
