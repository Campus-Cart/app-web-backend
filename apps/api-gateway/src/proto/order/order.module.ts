/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ClientsModule, Transport} from '@nestjs/microservices';
import { IDENTITY_SERVICE } from 'src/users/constants';
import { IDENTITY_PACKAGE_NAME } from '@common/app-lib';
import { join } from 'path';
import { UsersService } from 'src/users/users.service';
import { OrderGateway } from './order.gateway';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
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
  ],
  controllers: [OrderController],
  providers: [OrderService, UsersService, OrderGateway],
  exports: [OrderService, TypeOrmModule, OrderGateway]
})
export class OrderModule {}
