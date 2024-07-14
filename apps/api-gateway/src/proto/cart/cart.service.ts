/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { CartItemDto } from './dto/create-cart.dto';
import { CartResponseDto } from './dto/cart-response.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async createCart(
    userId: string,
    itemDto: CartItemDto,
    subTotalPrice: number,
    totalPrice: number,
  ): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { userId: userId },
      relations: ['items'],
    });
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [{ ...itemDto, subTotalPrice }],
        totalPrice,
      });
      await this.cartRepository.save(cart);
    } else {
      // If the cart already exists, add the item to the existing cart
      const existingItem = cart.items.find(
        (item) => item.productId === itemDto.productId,
      );

      if (existingItem) {
        // If the item exists, update its quantity and prices
        existingItem.quantity += itemDto.quantity;
        existingItem.subTotalPrice = existingItem.quantity * itemDto.price;
        await this.cartItemRepository.save(existingItem);
      } else {
        // If the item doesn't exist, create a new cart item
        const newItem = this.cartItemRepository.create({
          ...itemDto,
          subTotalPrice,
          cart,
        });
        await this.cartItemRepository.save(newItem);
        cart.items.push(newItem);
      }
      // Recalculate cart total price after adding or updating items
      this.recalculateCart(cart);
      await this.cartRepository.save(cart);
    }
    return cart;
  }

  async getCart(userId: string): Promise<CartResponseDto> {
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items'],
    });
    return cart;
  }

  async deleteCart(userId: string): Promise<Cart> {
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      return null;
    }
    await this.cartRepository.remove(cart);
    return cart;
  }

  private recalculateCart(cart: Cart) {
    // cart.totalPrice = cart.items.reduce((acc, item) => acc + item.subTotalPrice, 0);
    cart.totalPrice = 0;
    cart.items.forEach((item) => {
      cart.totalPrice += item.quantity * item.price;
    });
  }

  private toCartResponseDto(cart: Cart): CartResponseDto {
    return {
      id: cart.id,
      userId: cart.userId,
      totalPrice: cart.totalPrice,
      items: cart.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        subTotalPrice: item.subTotalPrice,
      })),
    };
  }

  async addItemToCart(
    userId: string,
    itemDto: CartItemDto,
  ): Promise<CartResponseDto> {
    const { productId, quantity, price } = itemDto;
    const subTotalPrice = quantity * price;

    let cart = await this.cartRepository.findOne({
      where: { userId: userId },
      relations: ['items'],
    });

    if (!cart) {
      cart = await this.createCart(
        userId,
        itemDto,
        subTotalPrice,
        subTotalPrice,
      );
    } else {
      const existingItem = cart.items.find(
        (item) => item.productId === productId,
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subTotalPrice = existingItem.quantity * existingItem.price;
        await this.cartItemRepository.save(existingItem);
      } else {
        const newItem = this.cartItemRepository.create({
          productId,
          quantity,
          price,
          subTotalPrice,
        });
        newItem.cart = cart;
        await this.cartItemRepository.save(newItem);
        cart.items.push(newItem);
      }

      this.recalculateCart(cart);
      await this.cartRepository.save(cart);
    }
    return this.toCartResponseDto(cart);
  }

  async removeItemFromCart(userId: string, productId: string): Promise<any> {
    const cart = await this.cartRepository.findOne({
      where: { userId: userId },
      relations: ['items'],
    });

    if (!cart) {
      return null;
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId,
    );

    if (itemIndex > -1) {
      const itemToRemove = cart.items[itemIndex];
      cart.items.splice(itemIndex, 1);
      this.recalculateCart(cart);
      await this.cartRepository.save(cart);
      await this.cartItemRepository.remove(itemToRemove);
    }
    return cart;
  }
}
