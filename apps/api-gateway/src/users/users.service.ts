/* eslint-disable prettier/prettier */
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import {
  CreateUserDto,
  USER_SERVICE_NAME,
  UpdateUserDto,
  UserServiceClient,
} from '@common/app-lib';
import { IDENTITY_SERVICE } from './constants';
import { ClientGrpc } from '@nestjs/microservices';

@Injectable()
export class UsersService implements OnModuleInit {
  private usersService: UserServiceClient;

  constructor(@Inject(IDENTITY_SERVICE) private client: ClientGrpc) {}

  onModuleInit() {
    this.usersService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }
  create(createUserDto: CreateUserDto) {
    return this.usersService.createUser(createUserDto);
  }

  findAll() {
    return this.usersService.findAllUsers({});
  }

  findOne(id: string) {
    return this.usersService.findOneUser({ id });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.usersService.updateUser({ id, ...updateUserDto });
  }

  remove(id: string) {
    return this.usersService.removeUser({ id });
  }

  findOneUserByPrimaryEmailAddress(email: string) {
    return this.usersService.findOneUserByPrimaryEmailAddress({ email });
  }
}
