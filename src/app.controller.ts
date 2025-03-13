/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Post, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';

interface HelloResponse {
    message: string;
    statusCode: number;
}

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    getHello(): string {
        return this.appService.getHello();
    }

    @Post('/hello')
    postHello(@Body('name') name: string): HelloResponse {
        if (!name) {
            return {
                message: 'Name is required',
                statusCode: HttpStatus.BAD_REQUEST
            };
        }

        return {
            message: `Welcome to ${name}`,
            statusCode: HttpStatus.OK
        };
    }
}
