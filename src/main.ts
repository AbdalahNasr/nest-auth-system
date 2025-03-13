/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Validation setup
  app.useGlobalPipes(
    new ValidationPipe({
        whitelist: true,
        transform: true
    })
  );
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Config and middleware setup
  const configService = app.get(ConfigService);
  app.use(session({
    secret: configService.get<string>('SESSION_SECRET') ?? 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  }));

  // Authentication middleware
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(cookieParser());

  // Start server
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch(console.error);
