/* eslint-disable prettier/prettier */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { jwtConstants } from '../constants';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
[[[]]]

@Injectable()
export class VerifyLogin implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const access_token = this.extractTokenFromHeader(request);

    if (!access_token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(access_token, {
        secret: jwtConstants.secret,
      });
      // console.log(jwtConstants.secret)
      if (!payload.id) return false;

      const user = await this.userService.findOne(payload.id);
      // const userResponse = new UserResponseDto(user);

      request.user = user;
    } catch (err) {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
