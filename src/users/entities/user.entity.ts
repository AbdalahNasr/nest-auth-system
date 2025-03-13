/* eslint-disable prettier/prettier */
import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    OneToOne, 
    OneToMany, 
    Index, 
    BeforeUpdate,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn
} from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';
import { Mail } from '../../mail/entities/mail.entity';
import { 
    IsEmail, 
    IsPhoneNumber, 
    IsOptional, 
    MinLength,
    IsString, 
    IsDate, 
    IsArray, 
    IsObject,
    
    ValidateNested
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { SocialLinks, UserPreferences, SecurityQuestions } from '../interfaces/user-types';

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
  id!: string;

  // Basic Information
  @Column()
  @MinLength(2)
  username!: string;

  @Index()
  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Index()
  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  // Timestamps
  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updatedAt?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date;

  // Profile Information
  @Column({ nullable: true })
  avatar?: string;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  socialLinks?: SocialLinks;

  @Column({ type: 'json', nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  preferences?: UserPreferences;

  // Security Questions
  @Column({ type: 'json', nullable: true })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  securityQuestions?: SecurityQuestions;

  // Email Verification
  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  emailVerifiedAt?: Date;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previousEmails?: string[];

  // SMS Verification
  @Column({ nullable: true })
  @IsOptional()
  @MinLength(6)
  @IsString()
  otpCode?: string;

  @Column({ nullable: true })
  otpExpires?: Date;

  @Column({ type: 'boolean', default: false })
  isPhoneVerified: boolean = false;

  @Column({ type: 'timestamp', nullable: true })
  phoneVerifiedAt?: Date;

  // 2FA
  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled: boolean = false;

  @Column({ nullable: true })
  @IsOptional()
  @MinLength(32)
  @IsString()
  twoFactorSecret?: string;

  // Security & Token Management
  @Column({ nullable: true })
  @IsOptional()
  @MinLength(32)
  @IsString()
  refreshToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastTokenIssuedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  tokenVersion!: number;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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
  loginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lockoutUntil?: Date;

  // Relations
  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
  @JoinColumn()
  auth!: Auth;

  @OneToMany(() => Mail, (mail) => mail.user)
  mails!: Mail[];

  // Hooks
  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
}
