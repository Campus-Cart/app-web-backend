/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConstants } from './constants';
import { Auth } from './entities/auth.entity';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';
import { IDENTITY_SERVICE } from 'src/users/constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_PACKAGE_NAME } from '@common/app-lib';
import { join } from 'path';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forFeature([Auth]),
    UsersModule,
    ClientsModule.register([
      {
        name: IDENTITY_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5000',
          package: IDENTITY_PACKAGE_NAME,
          protoPath: join(__dirname, '../proto/identity.proto'),
        },
      },
    ]),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '6h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService],
  exports: [AuthService],
})
export class AuthModule {}
