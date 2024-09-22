export enum ProcessStatus{SUCCESS,FAILED}

export enum ProcessCommand{
    ORDER,
    RESERVE,
    PAY
}

export class OrderLog{
    status:ProcessStatus
    orderId:number
    processedAt:Date
    errorMessage:string
    command:ProcessCommand

}

