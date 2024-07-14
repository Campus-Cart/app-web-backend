/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, OneToMany, Column } from 'typeorm';
import { OrderItem } from './order-item.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  items: OrderItem[];

  @Column({ type: 'decimal', default: 0 })
  totalAmount: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ default: 'pending' })
  status: string;
}
