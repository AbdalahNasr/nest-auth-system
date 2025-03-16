/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Auth } from './entities/auth.entity';
import { Repository, DeepPartial } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { User, UserStatus } from '../users/entities/user.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto/login.dto';
import * as nodemailer from 'nodemailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto/reset-password.dto';
import { GoogleUserDto } from './dto/social-login.dto/social-login.dto';
import * as crypto from 'crypto';
import * as dotenv from 'dotenv';
import { Role } from '../users/enums/role.enum';

dotenv.config();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface RefreshTokenResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

interface TokenPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

interface GoogleLoginResponse {
  user: User;
  accessToken: string;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth) private readonly authRepository: Repository<Auth>,
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly httpService: HttpService, // Inject HttpService
  ) {}

  async register(registerDto: CreateAuthDto): Promise<User> {
    const { username, email, phone, password } = registerDto;

    const existingUser = await this.usersService.findByLogin(email) || 
      await this.usersService.findByLogin(username) || 
      await this.usersService.findByLogin(phone);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await this.usersService.createUser({
      username,
      email,
      phone,
      password: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async login(loginDto: LoginDto): Promise<{ 
    accessToken: string; 
    refreshToken: string;
    user: Partial<User> 
  }> {
    const { login, password } = loginDto;
    const user = await this.usersService.findByLogin(login);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate both tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.generateToken(user),
      this.generateRefreshToken(user)
    ]);

    // Hash and save refresh token
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(user.id, { 
      refreshToken: hashedRefreshToken,
      updatedAt: new Date()
    });

    return {
      accessToken,
      refreshToken, // Add this line to include refresh token in response
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles
      }
    };
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }

  async generateToken(user: User): Promise<string> {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles
    };
    return this.jwtService.signAsync(payload);
  }

  async refreshToken(id: string, refreshToken: string): Promise<TokenResponse> {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'roles', 'refreshToken'] 
    });

    if (!user?.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const isValid = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [newAccessToken, newRefreshToken] = await Promise.all([
      this.generateToken(user),
      this.generateRefreshToken(user)
    ]);

    // Hash and save new refresh token
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await this.usersRepository.update(user.id, {
      refreshToken: hashedRefreshToken,
      updatedAt: new Date()
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: user.roles
      }
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    const updates: DeepPartial<User> = {
      refreshToken: null,
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: new Date()
    };

    await this.usersRepository.update(userId, updates);
    return { message: 'Logged out successfully' };
  }

  async forgetPassword(forgetPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ 
      where: { email: forgetPasswordDto.email },
      select: ['id', 'email', 'resetToken', 'resetTokenExpires', 'roles'] // Add select fields
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email'); // email not found
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const updates: Partial<User> = {
      resetToken,
      resetTokenExpires: new Date(Date.now() + 3600000)
    };

    await this.usersRepository.save({ ...user, ...updates });
    await this.sendResetEmail(user.email, resetToken);
    return { message: 'Reset password link sent to your email' };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({ 
      where: { resetToken: resetPasswordDto.token },
      select: ['id', 'password', 'resetToken', 'resetTokenExpires', 'roles'] // Add select fields
    });

    if (!user) {
      throw new UnauthorizedException('Invalid reset token or user not found');
    }

    if (user.resetTokenExpires && user.resetTokenExpires < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    const updates: DeepPartial<User> = {
      password: await bcrypt.hash(resetPasswordDto.newPassword, 10),
      resetToken: null,
      resetTokenExpires: null,
      updatedAt: new Date()
    };

    await this.usersRepository.save({ ...user, ...updates });
    return { message: 'Password reset successfully' };
  }

  private async sendResetEmail(email: string, token: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Reset Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${token}">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to send reset email: ${error.message}`);
      } else {
        throw new Error('Failed to send reset email');
      }
    }
  }

  async googleLogin(user: GoogleUserDto): Promise<GoogleLoginResponse | { message: string }> {
    if (!user) {
      return { message: 'No user from google' };
    }

    const { email, displayName } = user;
    const foundUser = await this.findOrCreateUser(email, displayName);
    const accessToken = await this.generateToken(foundUser);
    
    return { 
      user: foundUser, 
      accessToken 
    };
  }

  async findOrCreateUser(email: string, displayName: string): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      const newUser: DeepPartial<User> = {
        email,
        username: displayName,
        roles: [Role.USER],
        password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
        status: UserStatus.ACTIVE, // Use enum instead of string
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      user = await this.usersRepository.save(newUser);
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string | number): Promise<User> {
    if (!id) {
      throw new UnauthorizedException('Invalid user ID');
    }
    const userId = typeof id === 'number' ? String(id) : id;
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async remove(id: string | number): Promise<void> {
    const userId = typeof id === 'number' ? String(id) : id;
    await this.usersRepository.delete(userId);
  }
}

