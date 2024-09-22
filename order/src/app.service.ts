import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Order} from "./order.entities";
import {Repository} from "typeorm";
import {ClientKafka} from "@nestjs/microservices";
import {LogStatus, OrderLog, ProcessCommand} from "./log.interface";
import {OrderStatus} from "./order.enum";
import * as retry from 'async-retry'
@Injectable()
export class OrderService {
    constructor(@Inject('ORDER_SERVICE') private orderBrokerServices: ClientKafka,
                @InjectRepository(Order) private orderRepository: Repository<Order>,
                @InjectRepository(OrderLog) private orderLogRepository: Repository<OrderLog>) {
    }

    //when order is placed with pending status
    //then we emit new inventory event
    //once the inventory reserved the product or failed after multiple times, it emit event to order microservices to whether continue payment processing or emit event to release to product in the inventory
    async createOrder(newOrderDto: Order) {
        const log = new OrderLog()
        try {
            await this.orderRepository.save(newOrderDto)
            await this.orderBrokerServices.emit('inventory_new_order', newOrderDto)
            log.status = LogStatus.SUCCESS
        } catch (e) {
            log.status = LogStatus.FAILED
            log.errorMessage = e.message
        } finally {
            await this.orderBrokerServices.emit('log_order', log)
        }
    }

    async processOrderAfterInventory(orderId: number, success: boolean) {
        //if inventory emit success:false then we release inventory
        //check orderLog {command:PAY, status:SUCCESS} if record was exists then we only update order.status to SUCCESS otherwise we try to call  payment service
        //in case of payment it should call payment service in exponential backoff style and after any retry it should log the result in log order
        //once payment was done it should update order.status to SUCCESS
        ///in case of payment multiple failure it should update order status to FAILED and release inventory
        //any retry should have order log
        //incase system was interupted during retry mechanism, a schaduled task will take a look at order table and will retry all pendding orders by emiting them inventory_new_order for inventory, to emit further needed events, that makes the whole system consistent
        const inventoryProcess = await this.orderLogRepository.find({where:{command:ProcessCommand.PAY, status:ProcessStatus.SUCCESS, orderId:orderId}})
        if(inventoryProcess){
            console.log(`found duplicate inventory reservation request for orderId: ${orderId}`)
            await this.inventoryBrokerServices.emit('order_payment_new', {orderId})
            return;
        }

        if (attempt >= 5) {
            console.log(`payment attempt reached its maximum retries, order will be failed and inventory will be released`)
            const order = await this.orderRepository.find({where: {orderId}})
            order.status = OrderStatus.FAILED
            await this.orderRepository.save(order)
            await this.orderBrokerServices.emit('inventory_release', order)
        }

        if (!success) {
            console.log(`inventory state is FAILED, so order will be failed`)
            const order = await this.orderRepository.find({where: {orderId}})
            order.status = OrderStatus.FAILED
            await this.orderRepository.save(order)
        }

        let payment = await this.orderBrokerServices.send('payment_inquiry', order)
        if (!payment || payment.status != true) {
            console.log(`payment inquiry was not found for orderId: ${orderId}`)
            payment = await this.orderBrokerServices.send('payment_new', order)

        } else {
            console.log(`payment inquiry indicates it was successful`)
        }
        if (!payment || payment.status == false) {
            console.error(`payment failed`)
            throw new Error("payment failed")
        }

        console.log(`payment success`)
        const order = await this.orderRepository.find({where: {orderId}})
        order.status = OrderStatus.SUCCESS
        await this.orderRepository.save(order)


    }


}
