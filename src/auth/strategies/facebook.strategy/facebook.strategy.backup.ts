/* eslint-disable prettier/prettier */
import passport from 'passport';
import { Strategy as FacebookStrategy, Profile } from 'passport-facebook';
import dotenv from 'dotenv';

dotenv.config();

// Define a proper User interface
interface User {
  id: string;
  displayName: string;
  photos?: string;
  email?: string;
}

// Facebook OAuth Strategy
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID ?? '',
      clientSecret: process.env.FACEBOOK_APP_SECRET ?? '',
      callbackURL: 'http://localhost:5000/auth/facebook/callback',
      profileFields: ['id', 'displayName', 'photos', 'email'],
    },
    (accessToken: string, refreshToken: string, profile: Profile, done: (error: any, user?: User) => void) => {
      try {
        if (!profile.id || !profile.displayName) {
          throw new Error('Invalid profile data');
        }

        const user: User = {
          id: profile.id,
          displayName: profile.displayName,
          photos: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : '',
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : '',
        };

        console.log('Facebook Profile:', user);
        return done(null, user);
      } catch (error) {
        return done(error instanceof Error ? error : new Error('Unknown error'));
      }
    }
  )
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

export default passport;
