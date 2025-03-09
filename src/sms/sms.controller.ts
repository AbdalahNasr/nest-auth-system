/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { SmsService } from './sms.service';


@Controller('sms')
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { phoneNumber: string }) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
    return this.smsService.sendOtp(body.phoneNumber, otp);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { phoneNumber: string; otp: string }) {
    return this.smsService.verifyOtp(body.phoneNumber, body.otp);
  }
}
