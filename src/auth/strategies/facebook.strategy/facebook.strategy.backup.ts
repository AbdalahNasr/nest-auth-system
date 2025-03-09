/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'passport-facebook'; // Ensure Profile is correctly imported
import { VerifyCallback } from 'passport-oauth2'; // Fix missing type

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') || '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') || '',
      callbackURL: configService.get<string>('FACEBOOK_CALLBACK_URL') || 'http://localhost:5000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'emails'], // 'emails' should be plural
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback, // Ensure this is properly typed
  ): Promise<any> {
    try {
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        photos: profile.photos?.[0]?.value ?? '',
        email: profile.emails?.[0]?.value ?? '',
      };

      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }
}
