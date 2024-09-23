import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn, ManyToOne} from 'typeorm';
import {OrderStatus} from "../order.enum";
import {Product} from "./product.entity";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;
    @ManyToOne(() => Product, )
    @JoinColumn({ name: 'product', referencedColumnName: 'id' })
    product: Product;//todo check this is id if relations:{product:false}
    @Column()
    quantity: number;
    @Column()
    status:OrderStatus

}
