/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, StrategyOptions } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile', 'phone'], // Request phone number
    } as StrategyOptions);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: { 
      emails?: { value: string }[];
      displayName?: string;
      phoneNumbers?: { value: string }[];
    }
  ) {
    const email = profile?.emails?.[0]?.value || null;
    const name = profile?.displayName || '';
    const phone = profile?.phoneNumbers?.[0]?.value || null;

    // Require phone number before proceeding
    if (!phone) {
      throw new Error('Phone number is required');
    }

    return { email, name, phone };
  }
}
