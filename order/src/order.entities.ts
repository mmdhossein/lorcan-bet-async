import {Entity, Column, PrimaryGeneratedColumn, ManyToMany, JoinColumn} from 'typeorm';
import {OrderStatus} from "./order.enum";
import {Product} from "./product.interface";

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    @ManyToMany(()=>Product)
    @JoinColumn({ name: 'productId', referencedColumnName: 'id' })
    product: Product;//todo check this is id if relations:{product:false}
    @Column()
    quantity: number;
    @Column()
    status:OrderStatus

}
