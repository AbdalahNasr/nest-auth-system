/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, OneToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Auth {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.auth)
    user!: User;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;
}
