import {IProduct} from "../interfaces/product.interface";
import {ApiProperty} from "@nestjs/swagger";

export class CreateProductDto implements IProduct{
    @ApiProperty()
    description: string;
    id: number;
    @ApiProperty()
    name: string;
    @ApiProperty()
    price: number;

}