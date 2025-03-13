/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import speakeasy from 'speakeasy';
import { ConfigService } from '@nestjs/config';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { TwoFactorSecret, Enable2FAResponse } from './interfaces/two-factor.interface';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private configService: ConfigService
  ) {}

  async createUser(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepo.create(userData);
    return this.userRepo.save(newUser);
  }

  async findByLogin(login: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: [
        { username: login },
        { email: login },
        { password: login }
      ]
    });
  }

  async findUserById(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);
    return this.userRepo.save(user);
  }

  async verifyEmail(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    return this.userRepo.save(user);
  }

  private generate2FASecret(userId: string): TwoFactorSecret {
    const appName = this.configService.get<string>('APP_NAME') ?? 'First Project';
    const secret = speakeasy.generateSecret({
      length: 32,
      name: `${appName}:${userId}`,
      issuer: appName
    }) as TwoFactorSecret;

    if (!secret?.base32) {
      throw new Error('Failed to generate 2FA secret');
    }

    return secret;
  }

  async enable2FA(userId: string): Promise<Enable2FAResponse> {
    const user = await this.findUserById(userId);
    const secret = this.generate2FASecret(user.id);

    // Update user with 2FA settings
    Object.assign(user, {
      isTwoFactorEnabled: true,
      twoFactorSecret: secret.base32
    });

    await this.userRepo.save(user);

    return {
      secret: secret.base32,
      otpauthUrl: secret.otpauth_url
    };
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }
  }
}
