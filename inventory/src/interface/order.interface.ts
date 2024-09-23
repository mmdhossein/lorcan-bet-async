export enum OrderStatus {
    PENDING,
    FAILED,
    SUCCESS
}

export interface IProduct{
    price:number
    id:number
}
export interface IOrder {
    id: number;
    product: IProduct;
    quantity: number;
    status:OrderStatus

}