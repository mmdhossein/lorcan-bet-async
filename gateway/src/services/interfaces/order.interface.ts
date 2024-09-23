import {IProduct} from "./product.interface";

export enum OrderStatus {
    PENDING,
    FAILED,
    SUCCESS
}


export interface IOrder {
    id: number;
    product: number;//todo check this is id if relations:{product:false}
    quantity: number;
    status:OrderStatus

}