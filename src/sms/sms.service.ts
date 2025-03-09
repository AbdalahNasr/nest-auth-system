/* eslint-disable prettier/prettier */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  // Store OTPs temporarily (use a proper database in production)
  private otpStore: Map<string, string> = new Map();

  async sendOtp(phoneNumber: string, otp: string) {
    try {
      this.otpStore.set(phoneNumber, otp); // Store OTP for later verification

      return await this.client.messages.create({
        body: `Your OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      throw new InternalServerErrorException('Failed to send OTP');
    }
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async verifyOtp(phoneNumber: string, otp: string): Promise<{ success: boolean; message: string }> {
    const storedOtp = this.otpStore.get(phoneNumber);
    if (!storedOtp) {
      return { success: false, message: 'No OTP found for this number' };
    }

    if (storedOtp !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }

    this.otpStore.delete(phoneNumber); // Remove OTP after successful verification
    return { success: true, message: 'OTP verified successfully' };
  }
}
