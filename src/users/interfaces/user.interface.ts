/* eslint-disable prettier/prettier */
export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  phone?: string;
  roles: string[];
  refreshToken?: string | undefined;
  resetToken?: string | undefined;
  resetTokenExpires?: Date | undefined;
}