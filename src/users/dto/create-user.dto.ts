/* eslint-disable prettier/prettier */
import {  IsArray, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../enums/role.enum';

export class CreateUserDto {
  @IsArray()
  @IsEnum(Role, { each: true })
  @IsOptional()
  roles?: Role[] = [Role.USER];
}
