import {Controller, Get, Inject} from '@nestjs/common';
import {OrderService} from './app.service';
import {ClientKafka, EventPattern, MessagePattern} from "@nestjs/microservices";
import {Order} from "./entities/order.entities";

@Controller()
export class AppController {
    constructor(private readonly appService: OrderService,@Inject('ORDER_SERVICE') private client: ClientKafka) {
    }

    @MessagePattern('order_create')
    createOrder(order: Order) {
        return this.appService.createOrder(order);
    }

    @EventPattern('order_payment')
    onOrderInventoryReservation(req: {orderId:number, amount:number}) {
        return this.appService.onOrderPayment(req.orderId,req.amount);
    }

    @EventPattern('order_failed')
    onOrderFailure(req: {orderId:number,}) {
        return this.appService.onOrderFailure(req.orderId);
    }

    async onModuleInit(){
        this.client.subscribeToResponseOf('payment_inquiry');
        this.client.subscribeToResponseOf('payment_create');
        await this.client.connect()
    }

}
