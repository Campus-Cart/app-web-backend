/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_PACKAGE_NAME } from '@common/app-lib';
import { join } from 'path';
import { IDENTITY_SERVICE } from 'src/users/constants';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem]),
    ClientsModule.register([
      {
        name: IDENTITY_SERVICE,
        transport: Transport.GRPC,
        options: {
          url: 'localhost:5000',
          package: IDENTITY_PACKAGE_NAME,
          protoPath: join(__dirname, '../proto/identity.proto'),
        },
      }
    ])
  ],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService]
})
export class CartModule {}
