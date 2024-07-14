/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Param, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { PaystackService } from './paystack.service';
import crypto from 'crypto';

@Controller('paystack')
export class PaystackController {
  constructor(private readonly paystackService: PaystackService) {}

  @Post('initialize')
  async initializePayment(
    @Body() initializePaymentDto: { email: string; amount: number },
  ) {
    const { email, amount } = initializePaymentDto;
    return this.paystackService.initializePayment(email, amount);
  }

  @Post('verify/:reference')
  async verifyPayment(@Param('reference') reference: string) {
    return this.paystackService.verifyPayment(reference);
  }
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-paystack-signature') signature: string,
  ) {
    // Verify the webhook signature
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (hash === signature) {
      // Process the webhook event
      const event = payload;
      switch (event.event) {
        case 'charge.success':
          // Handle successful charge
          break;
        // Handle other events...
        default:
          console.warn(`Unhandled event type ${event.event}`);
      }
      return { received: true };
    } else {
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }
  }
}
