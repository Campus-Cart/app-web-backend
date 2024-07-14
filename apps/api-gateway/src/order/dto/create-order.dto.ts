/* eslint-disable prettier/prettier */
import { OrderItem } from "../entities/order-item.entity";

export class CreateOrderDto {
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    createdAt: Date;
    status: string;
}

export class OrderItemDto {
    orderId: string;
    productId: string;
    quantity: number;
    price: number;
}