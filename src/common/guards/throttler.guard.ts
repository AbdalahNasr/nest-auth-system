/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Request): Promise<string> {
    const ip = req.ip;
    const ips = req.ips;
    
    if (ips && ips.length > 0) {
      return Promise.resolve(ips[0]);
    }
    
    return Promise.resolve(ip || 'unknown');
  }
}