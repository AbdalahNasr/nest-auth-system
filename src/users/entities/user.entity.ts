/* eslint-disable prettier/prettier */
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    OneToMany, 
    Index, 
    BeforeUpdate,
} from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';
import { Mail } from '../../mail/entities/mail.entity';

export enum UserStatus {
  ACTIVE = 'active',      
  INACTIVE = 'inactive',  
  PENDING = 'pending',    
  BANNED = 'banned',      // account blocked🚫
  IDLE = 'idle',          
  BLOCKED = 'blocked',    // account blocked by the management🚫
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Basic Information
  @Column()
  username: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Index()
  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  // Timestamps
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  // Profile Information
  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'json', nullable: true })
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    google?: string;
    github?: string;
  };

  @Column({ type: 'json', nullable: true })
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
    theme?: string;
  };

  // Security Questions
  @Column({ type: 'json', nullable: true })
  securityQuestions?: {
    question1: string;
    answer1: string;
    question2: string;
    answer2: string;
    question3: string;
    answer3: string;
  };

  // Email Verification
  @Column({ type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column({ type: 'boolean', default: false })
  isEmailVerified: boolean;

  @Column({ type: 'simple-array', nullable: true })
  previousEmails?: string[];

  // SMS Verification
  @Column({ nullable: true })
  otpCode?: string;

  @Column({ nullable: true })
  otpExpires?: Date;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  // 2FA
  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean;

  @Column({ nullable: true })
  twoFactorSecret?: string;

  // Security & Token Management
  @Column({ nullable: true })
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTokenIssuedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  tokenVersion: number;

  @Column({ type: 'simple-array', nullable: true })
  deviceIds?: string[];

  // Password Management
  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChange?: Date;

  @Column({ nullable: true })
  resetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires?: Date;

  // Security Monitoring
  @Column({ type: 'integer', default: 0 })
  loginAttempts: number;

  @Column({ type: 'timestamp', nullable: true })
  lockoutUntil?: Date;

  // Relations
  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
  auth: Auth;

  @OneToMany(() => Mail, (mail) => mail.user)
  mails: Mail[];

  // Hooks
  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
