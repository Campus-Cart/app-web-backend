/* eslint-disable prettier/prettier */
import { Controller, Post, Patch, Body, Param, UseGuards, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderItem } from './entities/order-item.entity';
import { VerifyLogin } from 'src/auth/guards/verifylogin.strategy';
import { Order } from './entities/order.entity';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @UseGuards(VerifyLogin)
  @Post()
  async createOrder(
    @Body('userId') userId: string,
    @Body('orderItems') orderItems: OrderItem[],
  ): Promise<Order> {
    return this.orderService.createOrder(userId, orderItems);
  }
  // async createOrder(
  //   @Body() createOrderDto: CreateOrderDto,
  // ) {
  //   const { userId, items } = createOrderDto;
  //   return this.orderService.createOrder(userId, items);
  // }

  @UseGuards(VerifyLogin)
  @Patch(':orderId/complete')
  async completeOrder(@Param('orderId') orderId: string): Promise<Order> {
    const order = await this.orderService.getOrder(orderId);
    return this.orderService.completeOrder(order);
  }

  @UseGuards(VerifyLogin)
  @Patch(':orderId/cancel')
  async cancelOrder(@Param('orderId') orderId: string): Promise<Order> {
    const order = await this.orderService.getOrder(orderId);
    return this.orderService.cancelOrder(order);
  }

  @UseGuards(VerifyLogin)
  @Get(':orderId')
  async getOrder(@Param('orderId') id: string): Promise<Order> {
    return this.orderService.getOrder(id);
  }
}