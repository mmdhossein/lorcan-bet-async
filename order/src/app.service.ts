import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Order} from "./entities/order.entities";
import {Repository} from "typeorm";
import {ClientKafka} from "@nestjs/microservices";
import {OrderStatus} from "./order.enum";
import {OrderLog, ProcessCommand, ProcessStatus} from "./entities/log.entity";
import * as retry from 'async-retry'
import { catchError, firstValueFrom } from 'rxjs';
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
        log.command = ProcessCommand.ORDER
        log.processedAt = new Date()
        try {
            await this.orderRepository.save(newOrderDto)
            console.log('order is saved')
            await this.orderBrokerServices.emit('inventory_new_order', newOrderDto)
            console.log('order reservation is emitted')
            log.status = ProcessStatus.SUCCESS
        } catch (e) {
            console.log('error on processing order', e)
            log.status = ProcessStatus.FAILED
            log.errorMessage = e.message
        } finally {
            await this.orderBrokerServices.emit('log_order', log)
        }
    }

    async onOrderPayment(orderId: number, amount: number) {
        //if inventory emit success:false then we release inventory
        //check orderLog {command:PAY, status:SUCCESS} if record was exists then we only update order.status to SUCCESS otherwise we try to call  payment service
        //in case of payment it should call payment service in exponential backoff style and after any retry it should log the result in log order
        //once payment was done it should update order.status to SUCCESS
        ///in case of payment multiple failure it should update order status to FAILED and release inventory
        //any retry should have order log
        //incase system was interupted during retry mechanism, a schaduled task will take a look at order table and will retry all pendding orders by emiting them inventory_new_order for inventory, to emit further needed events, that makes the whole system consistent
        console.log(`received inventory reservation, orderId:${orderId}, status:SUCCESS`)
        console.log(`inventory state is FAILED, so order will be failed`)

        const orderPaymentLog = await this.orderLogRepository.find({
            where: {
                command: ProcessCommand.PAY,
                status: ProcessStatus.SUCCESS,
                orderId: orderId
            }
        })
        if (orderPaymentLog) {
            console.log(`found duplicate order payment request for orderId: ${orderId}, payment already successful`)

            return;
        }

        await retry(async (bail, attempt) => {
            const log = new OrderLog()
            log.orderId = orderId
            log.command = ProcessCommand.PAY
            log.processedAt = new Date()
            console.log(`order payment attempt no : ${attempt}`)

            try{
                if (attempt >= 6) {
                    log.errorMessage = `payment attempt reached its maximum retries, order will be failed and inventory will be released orderId:${orderId}`
                    console.error(log.errorMessage)
                    await this.orderBrokerServices.emit('order_failed', {orderId})
                    await this.orderBrokerServices.emit('inventory_release', {orderId})
                }

                let payment = await firstValueFrom(this.orderBrokerServices.send('payment_inquiry', {orderId}))
                if (!payment || payment.status != true) {
                    console.log(`payment was not found for orderId: ${orderId}`)
                    payment = await this.orderBrokerServices.send('payment_create', {orderId, amount})
                    if (!payment || payment.status == false) {

                        console.error(`payment request failed`)
                        throw new Error(log.errorMessage)
                    }

                }
                if (payment && payment.status) {
                    log.status = ProcessStatus.SUCCESS
                    console.log(`payment success`)
                    const order = await this.orderRepository.findOne({where: {id: orderId}})
                    order.status = OrderStatus.SUCCESS
                    await this.orderRepository.save(order)
                } else {
                    console.error(`payment failed`)
                    log.status = ProcessStatus.FAILED
                }
            }
            catch (e) {
                log.errorMessage = e.message
                console.error(e)
                throw e
            }finally {
               await this.orderLogRepository.save(log)

            }


        }, {retries: 6})


    }

    async onOrderFailure(orderId: number) {
        console.log(`order status will be FAILED`)
        await this.orderRepository.save({id: orderId, status: OrderStatus.FAILED})
        return
    }


}
