/* eslint-disable prettier/prettier */
import { User } from '../../../../users/entities/user.entity';

export class GoogleLoginResponseDto {
  user: User;
  accessToken: string;
}