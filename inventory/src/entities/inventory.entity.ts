import {Entity, Column, PrimaryGeneratedColumn, OneToOne, JoinColumn} from 'typeorm';
import {Product} from "./product.entity";

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(()=>Product)
    @JoinColumn({ name: 'product', referencedColumnName: 'id' })
    product: Product;

    @Column()
    quantity: number;

}
