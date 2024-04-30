/* eslint-disable prettier/prettier */
import { Column, Entity, Index, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({length: 50})
    @Index({ unique: true })
    email: string;

    @Column({ nullable: true, unique: true })
    phoneNo: string;

    @Column()
    password: string;

    @Column({ default: true })
    isActive?: boolean;

    @Column({nullable: true})
    homeAddress?: string;

    @Column({ default: false })
    isEmailVerified?: boolean;
}