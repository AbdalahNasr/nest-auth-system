/* eslint-disable prettier/prettier */
export interface GoogleLoginResponse {
    user?: {
      email: string;
      id: string;
    };
    accessToken?: string;
    message?: string;
  }