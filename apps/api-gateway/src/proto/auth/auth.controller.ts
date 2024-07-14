/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Get,
  UnauthorizedException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { VerifyLogin } from './guards/verifylogin.strategy';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @ApiOperation({summary: 'Sign in'})
  async signIn(@Body() body: LoginDto, @Res() response) {
    // console.log(response)
    const response_data = await this.authService.signIn(
      body.email,
      body.password,
    );
    response.status(HttpStatus.OK).json({
      status: 'success',
      message: 'User login successful',
      data: response_data,
    });
    console.log(response.status)
  }
  @UseGuards(VerifyLogin)
  @Get('profile')
  getProfile(@Request() req) {
    console.log(req)
    if (req.user) {
      console.log('req.user', typeof req.user.id, req.user.id);
      return req.user;
    } else {
      throw new UnauthorizedException();
    }
  }
}
