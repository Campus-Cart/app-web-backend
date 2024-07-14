/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (order) => order.items)
  order: Order;

  // @Column()
  // orderId: number;

  @Column()
  productId: string;

  @Column({type: 'int'})
  quantity: number;

  @Column({ type: 'decimal'})
  price: number;

  @Column({type: 'decimal'})
  subTotalPrice: number;
}
