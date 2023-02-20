import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { UserResponseInterface } from './entities/userResponse.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private config: ConfigService, private jwt: JwtService){}

  async signToken(userId: number, username: string){
    const secret = this.config.get('secret')
    const payload = {
      sub: userId,
      username: username
    }
    return this.jwt.signAsync(payload, {
      secret: secret
    })
  }

  async create(createUserDto: CreateUserDto) {
    try{
      const hash = await bcrypt.hash(createUserDto.password, 10);
      const user = await this.userRepository.save({
        ...createUserDto,
        hash
      })
      return user;
    }catch(err){
      if(err.code === '23505'){
        throw new ForbiddenException('username already used!!!');
      }
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({where:{
      username : loginDto.username,
    }})
    if(!user){
      throw new ForbiddenException('Wrong username or Password')
    }

    const psswd = await bcrypt.compare(loginDto.password, user.hash);
    if(!user || !psswd){
      throw new ForbiddenException('Wrong Username or Password');
    }
    delete user.hash;
    return user;

    }

  async update(currentUserUsername: string, updateDto: UpdateUserDto) {
    const user = await this.userRepository.findOne({where:{
      username : currentUserUsername,
    }})
    
    if(!user){
      throw new ForbiddenException('No such user');
    }

    Object.assign(user, updateDto)
    
    return await this.userRepository.save(user);
  }

  async remove(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({where:{
      username : loginDto.username,
    }})
    if(!user){
      throw new ForbiddenException('Wrong Username or Password');
    }
    const psswd = await bcrypt.compare(loginDto.password, user.hash);
    if(!psswd){
      throw new ForbiddenException('Wrong Username or Password');
    }
    const deleteUser = await this.userRepository.delete({
      username: loginDto.username
    })
  return "user Deleted successfully";
  }

  buildUserResponse(user: UserEntity): UserResponseInterface{
    return {
      user: {
        ...user,
        token: this.signToken(user.id, user.username)
      }
    }
  }
}