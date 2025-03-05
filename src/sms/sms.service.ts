/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  async sendOtp(phoneNumber: string, otp: string) {
    return  this.client.messages.create({
      body: `Your OTP is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
  }
}
