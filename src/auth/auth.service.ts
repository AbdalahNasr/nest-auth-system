/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Auth } from './entities/auth.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto/login.dto';
// import { Tokens } from './dto/tokens/tokens';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
import {  GoogleUserDto } from './dto/social-login.dto/social-login.dto';
// import  nodemailer  from 'nodemailer';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(registerDto: CreateAuthDto) {
    const { username, email, phone, password } = registerDto;

    const existingUser = await this.usersService.findByLogin(email) || 
      await this.usersService.findByLogin(username) || 
      await this.usersService.findByLogin(phone);

    if (existingUser) {
      throw new ConflictException('User with this email, username, or phone already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await this.usersService.createUser({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  async login(loginDto: LoginDto) {
    const { login, password } = loginDto;
    console.log('usersService:', this.usersService);

    const user = await this.usersService.findByLogin(login);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid data');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid data');
    }

    const accessToken = jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_SECRET as string, { expiresIn: '1h' }); // change it to 15m later 
    
    const refreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_SECRET as string, { expiresIn: '7d' });

    user.refreshToken = refreshToken;
    await this.usersRepository.save(user);
console.log({accessToken,refreshToken})
    return { accessToken, refreshToken };
  }

  /** 🔹 Refresh Access Token */
  async refreshToken(id: string, refreshToken: string) {
    const user = await this.usersRepository.findOne({ where: { id: String(id) } });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Verify stored refresh token
    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new access token
    // const tokens = await this.generateTokens(user.id.toString(), user.email);
    // return { accessToken: tokens.accessToken };
  }

  /** 🔹 Logout & Revoke Refresh Token */
  async logout(userId: string) {
    await this.usersRepository.update(userId, { refreshToken: undefined });
    return { message: 'Logged out successfully' };
  }

  // forget Password
  async forgetPassword(forgetPasswordDto: ForgotPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { email: forgetPasswordDto.email } });
    if (!user) {
      throw new UnauthorizedException('Invalid email'); // email not found
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 3600000);
    await this.usersRepository.save(user);
    await this.sendResetEmail(user.email, resetToken);
    return { message: 'Reset password link sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.usersRepository.findOne({ where: { resetToken: resetPasswordDto.token } });
    console.log('User Found:', user);
    if (!user) {
      throw new Error('Invalid reset token or user not found');
    }

    // Check if the reset token has expired
    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      throw new Error('Reset token has expired');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    // Change null to undefined
    user.resetToken = undefined;
    user.resetTokenExpires = undefined;
    await this.usersRepository.save(user);
    return { message: 'Password reset successfully' };
  }

  private async sendResetEmail(email: string, token: string) {
    // Add proper typing for nodemailer
    const sender = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER || '',
        pass: process.env.EMAIL_PASS || ''
      },
    } as nodemailer.TransportOptions);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };
    await sender.sendMail(mailOptions);
  }

  // 🔹 login with google 
  async googleLogin(user: GoogleUserDto): Promise<{ user: User; accessToken: string } | { message: string }> {
    if (!user) {
      return { message: 'No user from google' };
    }

    const { email, displayName } = user;
    const foundUser = await this.findOrCreateUser(email, displayName);

    const accessToken = this.generateToken(foundUser);
    return { user: foundUser, accessToken };
  }

  async findOrCreateUser(email: string, displayName: string): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      user = this.usersRepository.create({ email, username: displayName });
      await this.usersRepository.save(user);
    }
    return user;
  }

  generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email , username:user.username };
    return this.jwtService.sign(payload);
  }

  /** 🔹 Generate JWT Tokens */

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
