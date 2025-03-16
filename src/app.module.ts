/* eslint-disable prettier/prettier */
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MailModule } from './mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Auth } from './auth/entities/auth.entity';
import { Mail } from './mail/entities/mail.entity';
import { User } from 'src/users/entities/user.entity';
import { SmsModule } from './sms/sms.module';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { AuthMiddleware } from './auth/middlewares/middleware';
import { HttpModule } from '@nestjs/axios';

const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [{
    ttl: 60000,
    limit: 10
  }]
};

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Auth, Mail],
      synchronize: true,
      logging: true,
      charset: 'utf8mb4',
      // Add these options for better MySQL compatibility
      extra: {
        charset: 'utf8mb4_unicode_ci',
      }
    }),
    TypeOrmModule.forFeature([User, Auth, Mail]),
    AuthModule,
    UsersModule,
    MailModule,
    ConfigModule,
    SmsModule,
    ThrottlerModule.forRoot(throttlerConfig),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    })
  ],  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/register', method: RequestMethod.POST }
      )
      .forRoutes('*');
  }
}
// remove all the logs later
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USERNAME);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
