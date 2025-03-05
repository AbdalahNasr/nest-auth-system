import { Injectable } from '@nestjs/common';


@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello nest lerner !';
  }
  sayWelcomeToUser(name: string): string {
    return 'Hello ' + name;
  }
}

