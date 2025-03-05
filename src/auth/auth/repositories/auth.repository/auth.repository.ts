/* eslint-disable prettier/prettier */
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from 'src/auth/entities/auth.entity';

@Injectable()
export class AuthRepository extends Repository<Auth> {
  constructor(@InjectRepository(Auth) private readonly repo: Repository<Auth>) {
    super(repo.target, repo.manager, repo.queryRunner);
  }
}
