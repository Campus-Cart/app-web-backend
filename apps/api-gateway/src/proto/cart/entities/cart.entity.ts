/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, OneToMany, Column} from 'typeorm';
import { CartItem } from './cart-item.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @Column({ type: 'decimal', default: 0 })
  totalPrice: number;
}