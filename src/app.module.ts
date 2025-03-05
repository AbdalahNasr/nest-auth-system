/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
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

@Module({
  imports: [
TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT), // default port check later for security
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User , Auth,Mail],
      synchronize: true,
    }),
    AuthModule,
    UsersModule,
    MailModule,
    ConfigModule,
    SmsModule,
  ],  
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
// remove all the logs later
console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_USERNAME);
console.log(process.env.DB_PASSWORD);
console.log(process.env.DB_NAME);
