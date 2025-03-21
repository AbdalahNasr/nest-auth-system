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
import { GoogleStrategy } from './strategies/google.strategy/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy/facebook.strategy.backup';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([Auth, User]),
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    HttpModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshTokenStrategy,
    RefreshAuthGuard,
    JwtAuthGuard,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [AuthService , JwtModule],
})
export class AuthModule {}
console.log('JWT_SECRET:', process.env.JWT_SECRET);
console.log('JWT_EXPIRATION_TIME:', process.env.JWT_EXPIRES_IN);

