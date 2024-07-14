/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Cart } from './cart.entity';

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @Column()
  productId: string;

  @Column({type: 'int'})
  quantity: number;

  @Column({type: 'decimal'})
  price: number;

  @Column({type: 'decimal'})
  subTotalPrice: number;
}
