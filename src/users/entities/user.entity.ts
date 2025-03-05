/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, OneToMany } from 'typeorm';
import { Auth } from '../../auth/entities/auth.entity';
import { Mail } from '../../mail/entities/mail.entity';
export enum UserStatus {
  ACTIVE = 'active',      
  INACTIVE = 'inactive',  
  PENDING = 'pending',    
  BANNED = 'banned',    // account blocked🚫
  IDLE = 'idle',          
  BLOCKED = 'blocked',     // account blocked by the management🚫
}
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;
  @Column({ unique: true, nullable: true })
  phone: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus; // Store user status

  @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
  auth: Auth;

  @OneToMany(() => Mail, (mail) => mail.user)
  mails: Mail[];
  @Column({ nullable: true })
  refreshToken?: string; // Store refresh token securely
  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpires?: Date | null; // Store reset token expiration date securely
  @Column({ type: 'timestamp', nullable: true })
  lastLogin?: Date | null; // Store last login date securely
  @Column({ type: 'text',nullable:true})
  resetToken?: string | null; // Store reset token securely
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpires?: Date | null; // Store reset token expiration date securely
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date; // Automatically store creation date
  
  @Column({ nullable: true })
otpCode?: string; // OTP for SMS verification

@Column({ nullable: true })
otpExpires?: Date; // OTP expiration time
}
