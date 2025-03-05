/* eslint-disable prettier/prettier */
import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth } from './entities/auth.entity';
import { UsersModule } from 'src/users/users.module';
import { User } from 'src/users/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy/refresh-token.strategy';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { RefreshAuthGuard } from './guards/refresh-auth.guard/refresh-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard/jwt-auth.guard';

@Module({
    imports: [ 
      ConfigModule.forRoot(),
      TypeOrmModule.forFeature([Auth,User])
    ,forwardRef(() => UsersModule)
    ,PassportModule,JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await 
      useFactory: async (ConfigService:ConfigService) => ({ 
        
        //disable because we dont have await and its not neccessary
        //  in this part not an error because of nest structure
        // line 16 handle async db connection internally 
        // so we dont need to use await here
        secret: ConfigService.get<string>('JWT_SECRET')  ,
        signOptions: { expiresIn: '1h' },
      }),
    })],
  
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy ,RefreshTokenStrategy, RefreshAuthGuard, JwtAuthGuard, ],
  exports: [AuthService],
})
export class AuthModule {}
console.log('JWT_SECRET:',process.env.JWT_SECRET);
console.log('JWT_EXPIRATION_TIME:',process.env.JWT_EXPIRES_IN);

