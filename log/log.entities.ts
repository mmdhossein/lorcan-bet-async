import {Entity, Column, PrimaryGeneratedColumn, OneToMany} from 'typeorm';

@Entity()
export class OrderLog {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @ManyToMany(()=>Order)
    @JoinColumn()
    order: Order;//todo check this is id if relations:{product:false}

    @Column()
    status: OrderStatus;

    @Column()
    processedAt: Date;

    @Column()
    errorMessage: string;

}
