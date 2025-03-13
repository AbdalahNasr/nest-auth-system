/* eslint-disable prettier/prettier */
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from '../entities/user.entity';

interface RequestWithUser extends Request {
    user: {
        status: UserStatus;
    };
}

@Injectable()
export class UserStatusGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<RequestWithUser>();
        
        if (!request.user) {
            throw new UnauthorizedException('User not found in request');
        }

        if (!request.user.status) {
            throw new UnauthorizedException('User status not found');
        }

        const isActive = request.user.status === UserStatus.ACTIVE;
        
        if (!isActive) {
            throw new UnauthorizedException('User account is not active');
        }

        return isActive;
    }
}