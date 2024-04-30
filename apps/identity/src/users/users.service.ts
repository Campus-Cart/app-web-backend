/* eslint-disable prettier/prettier */
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateUserDto,
  UpdateUserDto,
  User as UserProp
} from '@common/app-lib';
import { randomUUID } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly users: User[] = [];
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserProp> {
    console.log(createUserDto)
    try {
      const user = await this.findOneUserByPrimaryEmailAddress(
        createUserDto.email
      )

      if (user) {
        throw new ConflictException('User with this email already exists');
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const userProps: UserProp = {
        id: randomUUID(),
        ...createUserDto,
        isEmailVerified: false,
        password: hashedPassword,
      }

      const newUser = this.usersRepository.create(userProps);
      return this.usersRepository.save(newUser)
    } catch (err) {
      console.log(err)
    }
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    // return this.users.find((user) => user.id === id);
    const user = await this.usersRepository.findOne({
      where: { id }
    })

    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({id: id});

    if (!user) {
      throw new NotFoundException(`User with ID: ${id} not found`);
    }

    // Object.assign(user, updateUserDto);
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.phoneNo) {
      user.phoneNo = updateUserDto.phoneNo;
    }

    await this.usersRepository.save(user);
    return user
  }

  async remove(id: string): Promise<UserProp> {
    // const userIndex = this.users.findIndex((user) => user.id === id);
    // if (userIndex !== -1) {
    //   return this.users.splice(userIndex)[0];
    // }
    // throw new NotFoundException(User not found by id ${id});

    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found by id ${id}`);
    }
    const removedUser = await this.usersRepository.remove(user);

    const userProps: UserProp = {
      ...removedUser,
    };

    return userProps;
  }

  findOneUserByPrimaryEmailAddress(email: string) {
    return this.usersRepository.findOneBy({ email })
  }
}
