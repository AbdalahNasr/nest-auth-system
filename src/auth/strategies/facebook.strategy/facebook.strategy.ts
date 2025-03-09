/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-facebook';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.get<string>('FACEBOOK_APP_ID') ?? '',
      clientSecret: configService.get<string>('FACEBOOK_APP_SECRET') ?? '',
      callbackURL: 'http://localhost:5000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async validate(accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: any) => void): Promise<any> {
    try {
      if (!profile.id || !profile.displayName) {
        throw new Error('Invalid profile data');
      }

      const user = {
        id: profile.id,
        displayName: profile.displayName,
        photos: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
      };

      console.log('Facebook Profile:', user);
      done(null, user);
    } catch (error) {
      done(error instanceof Error ? error : new Error('Unknown error'));
    }
  }
}
