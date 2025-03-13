/* eslint-disable prettier/prettier */

import { IsOptional, IsString, IsEmail, IsPhoneNumber, IsObject } from 'class-validator';
import { SocialLinks, UserPreferences } from '../interfaces/user-types';

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsPhoneNumber()
    phone?: string;

    @IsOptional()
    @IsObject()
    preferences?: UserPreferences;

    @IsOptional()
    @IsObject()
    socialLinks?: SocialLinks;

    @IsOptional()
    @IsString()
    avatar?: string;
}
