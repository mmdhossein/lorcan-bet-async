import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

@Entity()
export class Inventory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @OneToOne(()=>Product)
    @JoinColumn()
    product: Product;//todo check this is id if relations:{product:false}

    @Column()
    quantity: number;

}
