import {Body, Controller, Inject, Post} from "@nestjs/common";
import {ApiBody} from "@nestjs/swagger";
import {OrderService} from "./services/order.service";
import {OrderDto} from "./services/dtos/order.dto";

@Controller('order')
export class OrderController{
    constructor(@Inject() private orderService:OrderService) {
    }
    @Post()
    @ApiBody({
        type:OrderDto })
    async createProduct(@Body() req: OrderDto) {
        return await this.orderService.createOrder(req);
    }
}