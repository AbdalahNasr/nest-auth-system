/* eslint-disable prettier/prettier */

import { IsOptional, IsString, IsEmail, IsPhoneNumber, IsObject, IsArray, IsEnum } from 'class-validator';
import { SocialLinks, UserPreferences } from '../interfaces/user-types';
import { Role } from '../enums/role.enum';

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

    @IsArray()
    @IsEnum(Role, { each: true })
    @IsOptional()
    roles?: Role[];
}
