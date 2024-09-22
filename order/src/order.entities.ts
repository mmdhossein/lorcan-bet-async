import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

@Entity()
export class Order {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    @ManyToMany(()=>Product)
    @JoinColumn({ name: 'productId', referencedColumnName: 'id' }})
    product: Product;//todo check this is id if relations:{product:false}
    @Column()
    quantity: number;

}
