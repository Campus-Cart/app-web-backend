/* eslint-disable prettier/prettier */
import { CartItem } from "../entities/cart-item.entity";

export class CreateCartDto {
    userId: string;
    items: CartItem[];
    totalPrice: number;
}

export class CartItemDto {
    productId: string;
    quantity: number;
    price: number;
}
