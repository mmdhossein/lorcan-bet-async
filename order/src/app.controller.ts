import {Controller, Get} from '@nestjs/common';
import {OrderService} from './app.service';
import {EventPattern, MessagePattern} from "@nestjs/microservices";
import {Order} from "./order.entities";

@Controller()
export class AppController {
    constructor(private readonly appService: OrderService) {
    }

    @MessagePattern('order_create')
    createOrder(order: Order) {
        return this.appService.createOrder(order);
    }

    @EventPattern('order_payment_new')
    processOrderAfterInventory(req: {orderId:number, success:boolean}) {
        return this.appService.processOrderAfterInventory(req.orderId,req.success);
    }
}
