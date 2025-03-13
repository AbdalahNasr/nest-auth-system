/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Mail {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    subject!: string;

    @Column('text')
    content!: string;

    @CreateDateColumn()
    sentAt!: Date;

    @ManyToOne(() => User, (user) => user.mails)
    user!: User;
}
