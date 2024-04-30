/* eslint-disable prettier/prettier */
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { FindOneUserByPrimaryEmailAddressDto, User, USER_SERVICE_NAME, UserServiceClient } from '@common/app-lib';
import { IDENTITY_SERVICE } from 'src/users/constants';
import { ClientGrpc } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Observable } from 'rxjs';
import { jwtConstants } from './constants';

@Injectable()
export class AuthService {
  // private readonly usersService: UserServiceClient;
  private usersService: UserServiceClient;

  constructor(
    @Inject(IDENTITY_SERVICE) private client: ClientGrpc,
    private jwtService: JwtService,
  ) {
    // Debugging: Print JWT secret to ensure it's loaded correctly
    console.log('JWT Secret:', jwtConstants.secret);
  }
  
  onModuleInit() {
    this.usersService =
      this.client.getService<UserServiceClient>(USER_SERVICE_NAME);
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const email1: FindOneUserByPrimaryEmailAddressDto = { email: email };

    const user$: Observable<User> = await this.usersService.findOneUserByPrimaryEmailAddress(email1);
    // console.log(user$);
    try {
      // Convert the observable to a promise and await the result
      const user: User = await user$.toPromise();
      console.log(user);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const comparehash = await bcrypt.compare(pass, user.password);
      console.log(pass);
      // console.log(user.password);
      
      if (comparehash === false) {
        throw new UnauthorizedException('Invalid credentials. Password incorrect');
      }

      // If everything is okay, generate JWT token
      const payload = { email: user.email, id: user.id };
      console.log("Payload:", payload);
      const access_token = await this.jwtService.signAsync(payload);

      console.log('Access Token:', access_token);
      return { access_token };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid credentials.');
    }
}}