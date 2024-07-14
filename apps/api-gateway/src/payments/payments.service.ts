/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaystackService } from 'src/paystack/paystack.service';
import { Repository } from 'typeorm';
import { Order } from 'src/order/entities/order.entity';
import { InitializeDto } from './dto/intialize-payment.dto';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paystackService: PaystackService,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private orderService: OrderService,
  ) {}

  async initializePayment(
    initializePaymentDto: InitializeDto,
  ) {
    const { orderId, email, amount } = initializePaymentDto;

    // Check if the order exists and has a 'pending' status
    const order = await this.orderRepository.findOne({where: {id: orderId} });
    if (!order) {
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
    }
    if (order.status !== 'pending') {
      throw new HttpException(
        'Order status is not pending',
        HttpStatus.BAD_REQUEST,
      );
    }

    // Initialize payment with Paystack
    const paymentData = await this.paystackService.initializePayment(
      email,
      amount,
    );
    return { paymentData, orderId };
  }

  async verifyPayment(reference: string, orderId: string) {
    const verificationResponse =
      await this.paystackService.verifyPayment(reference);

      console.log('verificationResponse', verificationResponse)

    if (verificationResponse.data.status === 'success') {
      // Update order status to 'completed'
      const order = await this.orderRepository.findOne({ where: { id: orderId } });
      if (!order) {
        throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
      }
      await this.orderService.completeOrder(order);
      return { message: 'Payment successful and order completed' };
    } else {
      // Update order status to 'failed'
      await this.orderRepository.update(orderId, { status: 'failed' });
      throw new HttpException(
        'Payment verification failed',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
