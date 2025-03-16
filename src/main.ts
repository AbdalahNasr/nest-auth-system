/* eslint-disable prettier/prettier */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as passport from 'passport';
import * as session from 'express-session';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { useContainer } from 'class-validator';
import { 
  BadRequestException, 
  Logger, 
  ValidationPipe, 
  ValidationError,
  ValidationPipeOptions 
} from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);
    
    // Add global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());
    
    // Add global interceptor
    app.useGlobalInterceptors(new LoggingInterceptor());// , new LoggingInterceptor()); // solve type issue with ValidationPipeOptions type assertion
    
    // Validation setup with proper types
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const validationOptions: ValidationPipeOptions = {
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors: ValidationError[]): BadRequestException => {
        return new BadRequestException(errors);
      },
      
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        forbidNonWhitelisted: true,
        exceptionFactory: (errors) => {
          const messages = errors.map(error => ({
            field: error.property,
            message: Object.values(error.constraints || {}).join(', ')
          }));
          throw new BadRequestException(messages);
        }
      })
    );
    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    // Config and middleware setup
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    const sessionSecret = configService.getOrThrow<string>('SESSION_SECRET');
    const environment = configService.get<string>('NODE_ENV', 'development');
    const isProduction = environment === 'production';

    app.use(
      session({
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
          secure: isProduction,
          maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
      })
    );

    // Authentication middleware
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(cookieParser());

    // Start server
    await app.listen(port);
    const url = await app.getUrl();
    logger.log(`Application is running in ${environment} mode on: ${url}`);
  } catch (error: unknown) {
    logger.error(
      'Failed to start application:', 
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

void bootstrap();
