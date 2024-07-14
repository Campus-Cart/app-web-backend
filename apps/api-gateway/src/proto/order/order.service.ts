/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { NotFoundException } from '@nestjs/common';
import { OrderGateway } from './order.gateway';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    private orderGateway: OrderGateway,
  ) {}

  async createOrder(userId: string, orderItems: OrderItem[]): Promise<Order> {
    const newOrder = this.orderRepository.create({
      userId,
      createdAt: new Date(),
      status: 'pending', // You can set default status if needed
    });

    // Save the new order to the database
    await this.orderRepository.save(newOrder);

    // Create and save the order items
    const newOrderItems = orderItems.map((item) => {
      const orderItem = this.orderItemRepository.create({
        order: newOrder, // Establish the relationship
        productId: item.productId,
        quantity: item.quantity,
        price: item.price, // Assuming price is passed in orderItems
        subTotalPrice: item.quantity * item.price, // Calculate subTotalPrice
      });
      return orderItem;
    });

    // Save the order items to the database
    await this.orderItemRepository.save(newOrderItems);

    // Calculate the total amount for the order
    newOrder.totalAmount = newOrderItems.reduce(
      (total, item) => total + item.subTotalPrice,
      0,
    );

    // Save the updated order with total amount
    await this.orderRepository.save(newOrder);

    // this.orderGateway.notifyMerchant(newOrder);

    return newOrder;
  }

  async completeOrder(order: Order): Promise<Order> {
    order.status = 'completed';
    this.orderGateway.notifyMerchant(order);
    return this.orderRepository.save(order);
  }

  async cancelOrder(order: Order): Promise<Order> {
    order.status = 'cancelled';
    return this.orderRepository.save(order);
  }

  async getOrder(orderId: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['items'], // Load the related order items
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }
}
