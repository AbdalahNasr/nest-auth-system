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
    JoinColumn,
    AfterLoad,
    BeforeInsert
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
    ValidateNested,
    IsEnum,
    Min
} from 'class-validator';
import { Exclude, Type } from 'class-transformer';
import { SocialLinks, UserPreferences, SecurityQuestions } from '../interfaces/user-types';
import { Role } from '../enums/role.enum';

export enum UserStatus {
  ACTIVE = 'active',      
  INACTIVE = 'inactive',  
  PENDING = 'pending',    
  BANNED = 'banned',      
  IDLE = 'idle',          
  BLOCKED = 'blocked',    
}

// Add type definitions for JSON transformer
interface RoleTransformer {
  to: (value: Role[]) => string;
  from: (value: string) => Role[];
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Basic Information
  @Column({ unique: true })
  @MinLength(2)
  username!: string;

  @Index('IDX_user_email')
  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Index('IDX_user_phone')
  @Column({ unique: true, nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({
    type: 'json',
    nullable: false,
    transformer: {
      to: (value: Role[]): string => 
        JSON.stringify(Array.isArray(value) ? value : [Role.USER]),
      from: (value: string): Role[] => {
        try {
          const parsed = JSON.parse(value) as unknown;
          if (Array.isArray(parsed)) {
            const validRoles = parsed.filter((role): role is Role => 
              typeof role === 'string' && 
              Object.values(Role).includes(role as Role)
            );
            return validRoles.length ? validRoles : [Role.USER];
          }
          return [Role.USER];
        } catch {
          return [Role.USER];
        }
      }
    } satisfies RoleTransformer
  })
  @IsArray()
  @IsEnum(Role, { each: true })
  roles!: Role[];


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
  @Column({ type: 'varchar', length: 512, nullable: true })
  @IsOptional()
  @IsString()
  refreshToken: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  refreshTokenExpires: Date | null = null;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastTokenIssuedAt?: Date;

  @Column({ type: 'integer', default: 0 })
  @Min(0)
  tokenVersion!: number;

  @Column({ type: 'simple-array', nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  deviceIds?: string[];

  // Password Management
  @Column({ type: 'timestamp', nullable: true })
  lastPasswordChange: Date | null = null;

  @Column({ type: 'varchar', length: 512, nullable: true })
  @IsOptional()
  @IsString()
  resetToken: string | null = null;

  @Column({ type: 'timestamp', nullable: true })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  resetTokenExpires: Date | null = null;

  // Security Monitoring
  @Column({ type: 'integer', default: 0 })
  loginAttempts!: number;

  @Column({ type: 'timestamp', nullable: true })
  lockoutUntil?: Date;

  // Relations
  @OneToOne(() => Auth, (auth) => auth.user, { 
    cascade: true,
    onDelete: 'CASCADE' 
  })
  @JoinColumn({ name: 'authId' })
  auth!: Auth;

  @OneToMany(() => Mail, (mail) => mail.user, {
    cascade: true
  })
  mails!: Mail[];

  // Hooks
  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  @AfterLoad()
  parseRoles(): void {
    if (typeof this.roles === 'string') {
      try {
        const parsed = JSON.parse(this.roles) as unknown;
        this.roles = Array.isArray(parsed) ? 
          parsed.filter((role): role is Role => 
            typeof role === 'string' && 
            Object.values(Role).includes(role as Role)
          ) : 
          [Role.USER];
      } catch {
        this.roles = [Role.USER];
      }
    }
  }

  @BeforeInsert()
  setDefaultRoles(): void {
    if (!Array.isArray(this.roles) || !this.roles.length) {
      this.roles = [Role.USER];
    }
  }
}
