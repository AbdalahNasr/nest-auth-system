/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

interface RequestWithBody extends Request {
  body: Record<string, unknown>;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<RequestWithBody>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();
    
    const { method, url, ip } = request;
    const requestBody = request.body;

    return next.handle().pipe(
      tap({
        next: (data: unknown): void => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const statusCode = response.statusCode;

          this.logger.log(
            `[${method}] ${url} ${statusCode} ${duration}ms\n` +
            `IP: ${ip}\n` +
            `Body: ${JSON.stringify(requestBody)}\n` +
            `Response: ${JSON.stringify(data)}`
          );
        },
        error: (error: Error): void => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          this.logger.error(
            `[${method}] ${url} ${duration}ms\n` +
            `IP: ${ip}\n` +
            `Body: ${JSON.stringify(requestBody)}\n` +
            `Error: ${error.message}`
          );
        }
      })
    );
  }
}