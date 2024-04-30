/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { Timestamp } from "../google/protobuf/timestamp";

export const protobufPackage = "identity";

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  password: string;
}

export interface UpdateUserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  password: string;
}

export interface FindOneUserDto {
  id: string;
}

export interface FindOneUserByPrimaryEmailAddressDto {
  email: string;
}

export interface User {
  /** using uuid, hence string i.e. @PrimaryGeneratedColumn('uuid') */
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
  password: string;
  isActive?: boolean | undefined;
  homeAddress?: string | undefined;
  dateOfReg?: Timestamp | undefined;
  isEmailVerified?: boolean | undefined;
  resetPasswordToken?: string | undefined;
  resetPasswordExpiration?: Timestamp | undefined;
  primaryEmailVerificationToken?: string | undefined;
  emailVerificationTokenExpiration?: Timestamp | undefined;
  refreshTokenHash?: string | undefined;
}

export interface Users {
  users: User[];
}

/** Empty message */
export interface Empty {
}

export const IDENTITY_PACKAGE_NAME = "identity";

export interface UserServiceClient {
  createUser(request: CreateUserDto): Observable<User>;

  findAllUsers(request: Empty): Observable<Users>;

  findOneUser(request: FindOneUserDto): Observable<User>;

  updateUser(request: UpdateUserDto): Observable<User>;

  removeUser(request: FindOneUserDto): Observable<Empty>;

  findOneUserByPrimaryEmailAddress(request: FindOneUserByPrimaryEmailAddressDto): Observable<User>;
}

export interface UserServiceController {
  createUser(request: CreateUserDto): Promise<User> | Observable<User> | User;

  findAllUsers(request: Empty): Promise<Users> | Observable<Users> | Users;

  findOneUser(request: FindOneUserDto): Promise<User> | Observable<User> | User;

  updateUser(request: UpdateUserDto): Promise<User> | Observable<User> | User;

  removeUser(request: FindOneUserDto): Promise<Empty> | Observable<Empty> | Empty;

  findOneUserByPrimaryEmailAddress(
    request: FindOneUserByPrimaryEmailAddressDto,
  ): Promise<User> | Observable<User> | User;
}

export function UserServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = [
      "createUser",
      "findAllUsers",
      "findOneUser",
      "updateUser",
      "removeUser",
      "findOneUserByPrimaryEmailAddress",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("UserService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const USER_SERVICE_NAME = "UserService";
