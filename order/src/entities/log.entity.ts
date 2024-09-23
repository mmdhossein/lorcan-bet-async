import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

export enum ProcessStatus{SUCCESS,FAILED}

export enum ProcessCommand{
    ORDER,
    RESERVE,
    PAY
}
@Entity()
export class OrderLog{
    @PrimaryGeneratedColumn()
    id:number
    @Column()
    status:ProcessStatus
    orderId:number
    @Column()
    processedAt:Date
    @Column()
    errorMessage:string
    @Column()
    command:ProcessCommand

}