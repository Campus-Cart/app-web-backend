/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartItemDto, } from './dto/create-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post()
  async createCart(
    @Body('userId') userId: string,
    @Body('item') itemDto: CartItemDto,
    @Body('subTotalPrice') subTotalPrice: number,
    @Body('totalPrice') totalPrice: number,
  ) {
    return this.cartService.createCart(userId, itemDto, subTotalPrice, totalPrice);
  }

  @Get(':userId')
  async getCart(@Param('userId') userId: string) {
    return this.cartService.getCart(userId);
  }

  @Delete(':userId')
  async deleteCart(@Param('userId') userId: string) {
    return this.cartService.deleteCart(userId);
  }

 @Post(':userId/item')
  async addItemToCart(
    @Param('userId') userId: string,
    @Body() itemDto: CartItemDto,
  ) {
    return this.cartService.addItemToCart(userId, itemDto);
  }

  @Delete(':userId/item/:productId')
  async removeItemFromCart(
    @Param('userId') userId: string,
    @Param('productId') productId: string,
  ) {
    return this.cartService.removeItemFromCart(userId, productId);
  }
}
