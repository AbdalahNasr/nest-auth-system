import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('/hello')
  postHello(@Body('name') name: string, @Req() req, @Res() res) {
    // console.log(req.body);
    console.log(name);

    // eslint-disable-next-line prettier/prettier
    
    // return this.appService.sayWelcomeToUser(name);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return res.status(200).send(`Welcome to ${name}`);
  }
}
