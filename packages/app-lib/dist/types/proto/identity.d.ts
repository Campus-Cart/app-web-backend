import { Observable } from "rxjs";
import { Timestamp } from "../google/protobuf/timestamp";
export declare const protobufPackage = "identity";
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
export interface Empty {
}
export declare const IDENTITY_PACKAGE_NAME = "identity";
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
    findOneUserByPrimaryEmailAddress(request: FindOneUserByPrimaryEmailAddressDto): Promise<User> | Observable<User> | User;
}
export declare function UserServiceControllerMethods(): (constructor: Function) => void;
export declare const USER_SERVICE_NAME = "UserService";
