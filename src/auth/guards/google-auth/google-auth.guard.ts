/* eslint-disable prettier/prettier */
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { GoogleUserDto } from '../../dto/social-login.dto/social-login.dto';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest<TUser = GoogleUserDto>(
    err: Error | null,
    user: TUser | false
  ): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException('Authentication failed');
    }
    return user as TUser;
  }
}
