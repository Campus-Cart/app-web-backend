/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { PaymentService } from './payments.service';
import { PaymentController } from './payments.controller';
import { HttpModule } from '@nestjs/axios';
import { OrderService } from 'src/order/order.service';
import { PaystackModule } from 'src/paystack/paystack.module';
import { PaystackService } from 'src/paystack/paystack.service';
import { OrderModule } from 'src/order/order.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/order/entities/order.entity';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';
import { IDENTITY_SERVICE } from 'src/users/constants';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IDENTITY_PACKAGE_NAME } from '@common/app-lib';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]), 
    HttpModule,
    PaystackModule,
    OrderModule,
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
  controllers: [PaymentController],
  providers: [PaymentService, OrderService, PaystackService, UsersService],
})
export class PaymentsModule {}