/* eslint-disable prettier/prettier */
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity()
@Unique(['email'])
export class Merchant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  businessName: string;

  @Column({nullable: true})
  businessDescription: string;

  @Column()
  phoneNumber: string;
}
