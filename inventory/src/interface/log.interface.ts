import {Column, Entity} from "typeorm";

export enum ProcessStatus{SUCCESS,FAILED}


export enum ProcessCommand{
    ORDER,
    RESERVE,
    PAY
}


@Entity()
export class OrderLog{
    @Column()
    status:ProcessStatus
    orderId:number
    @Column()
    processedAt:Date
    @Column()
    errorMessage:string
    @Column()
    command:OrderCommand

}

