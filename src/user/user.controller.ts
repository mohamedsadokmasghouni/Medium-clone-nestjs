import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorators/user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('adduser')
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.create(createUserDto);
    return this.userService.buildUserResponse(user);
  }

  @Get('allusers')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('getuser')
  async findOne(@Body() loginDto: LoginDto) {
    const user = await this.userService.findOne(loginDto);
    return this.userService.buildUserResponse(user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('updateuser')
  update(@User('username') currentUserUsername: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(currentUserUsername, updateUserDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('deleteuser')
  remove(@Body() loginDto: LoginDto) {
    return this.userService.remove(loginDto);
  }
}
