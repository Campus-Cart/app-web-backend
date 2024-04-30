/* eslint-disable prettier/prettier */
import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';
import{
  CreateUserDto,
  UpdateUserDto,
  FindOneUserByPrimaryEmailAddressDto,
  FindOneUserDto,
  UserServiceController,
  UserServiceControllerMethods,
  Users
} from '@common/app-lib';
import { User } from './entities/user.entity';

@Controller()
@UserServiceControllerMethods()
export class UsersController implements UserServiceController {
  constructor(private readonly usersService: UsersService) {}

  createUser(createUserDto: CreateUserDto): Promise<User> {
    console.log(createUserDto);
    return this.usersService.create(createUserDto);
  }

  async findAllUsers(): Promise<Users> {
    const users = await this.usersService.findAll();
    return { users }; // Assuming 'users' is the property expected by the interface
  }

  findOneUser(findOneUserDto: FindOneUserDto): Promise<User>{
    return this.usersService.findOne(findOneUserDto.id);
  }

  updateUser(updateUserDto: UpdateUserDto): Promise<User>{
    return this.usersService.update(updateUserDto.id, updateUserDto);
  }

  removeUser(findOneUserDto: FindOneUserDto) {
    return this.usersService.remove(findOneUserDto.id);
  }

  findOneUserByPrimaryEmailAddress(
    findOneUserByPrimaryEmailAddressDto: FindOneUserByPrimaryEmailAddressDto,
  ): Promise<User> {
    return this.usersService.findOneUserByPrimaryEmailAddress(
      findOneUserByPrimaryEmailAddressDto.email,
    );
  }
}
