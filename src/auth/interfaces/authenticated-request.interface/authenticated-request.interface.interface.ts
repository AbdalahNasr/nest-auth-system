/* eslint-disable prettier/prettier */
import { Request } from 'express';
import { User } from '../../../users/entities/user.entity';

export interface AuthenticatedRequest extends Request {
  user: User;
  cookies: {
    refreshToken: string;
  };
}