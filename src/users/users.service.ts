/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>){}
  async createUser(userData:Partial<User>  ): Promise<User>{
      const newUser =this.userRepo.create(
        userData
      )
      return this.userRepo.save(newUser)
    }
    async findByLogin(login:string): Promise<User | null>{
      return this.userRepo.findOne({
        where:[
          {username:login},
          {email:login},
          {password:login}
        ]
      })
  
    }
    async findUserById(userId: string): Promise<User> {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return user;
    }
  
    // create(createUserDto: CreateUserDto) {
  //   return 'This action adds a new user';
  // }
  
  // async findByEmail(email:string){
  //   return this.userRepo.find((user)=>user.email === email)
  // }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  // update(id: number, updateUserDto: UpdateUserDto) {
  //   return `This action updates a #${id} user`;
  // }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
