/* eslint-disable prettier/prettier */
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PaystackService {
  private readonly paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  private readonly paystackBaseUrl = 'https://api.paystack.co';

  async initializePayment(email: string, amount: number) {
    console.log('Initializing payment for email:', email, '\n','amount:', amount);
  
    const url = `${this.paystackBaseUrl}/transaction/initialize`;
    const payload = {
      email,
      amount: amount * 100,
    };
  
    try {
      const response = await axios.post(url, payload, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error initializing payment:', error.response?.data);
      throw new HttpException(
        error.response?.data?.message || 'Payment initialization failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async verifyPayment(reference: string) {
    const url = `${this.paystackBaseUrl}/transaction/verify/${reference}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${this.paystackSecretKey}`,
        },
      });
      return response.data;
    } catch (error) {
      throw new HttpException(
        error.response?.data?.message || 'Payment verification failed',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
