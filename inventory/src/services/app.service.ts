import {Inject, Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Inventory} from "../entities/inventory.entity";
import {EntityManager, Repository} from "typeorm";
import * as retry from 'async-retry'
import {IOrder} from "../interface/order.interface";
import {OrderLog, ProcessCommand, ProcessStatus} from "../entities/log.entity";
import {ClientKafka} from "@nestjs/microservices";

@Injectable()
export class InventoryService {
    constructor(@InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
                @InjectRepository(OrderLog) private orderLogRepository: Repository<OrderLog>,
                @Inject('INVENTORY_SERVICE') private inventoryBrokerServices: ClientKafka) {

    }
  
  //this should be transactional
//todo this should run in async retry manner? package: async-retry
    //to handle idempotent operations, we need to introduce command field in "order log", once reserve product event reached inventory, we check that can we find a record where: {command:RESERVE, status:SUCCESS}
    //if there was a record we don't need to process it but, inventory needs to emit to order microservice that should resume payment
    //we will do the same in payment microservice we again check {command:PAY, status:SUCCESS} in our records to find out should we need to process payment or not
     async reserveInventory(order:IOrder) {
        try {

          console.log(`try find out if orderId ${order.id} reservation was already processed`)
          const inventoryProcess = await this.orderLogRepository.find({where:{command:ProcessCommand.RESERVE, status:ProcessStatus.SUCCESS, orderId:order.id}})
           if(inventoryProcess){
               console.log(`found duplicate inventory reservation request for orderId: ${order.id}`)
               await this.inventoryBrokerServices.emit('order_payment', order)
               return;
           }
            await retry(
                async (bail, attempt) => {
                    // if anything throws, we retry
                    //check inventory if we have enough quantity and deduce it, can you do it as a procedure or transactional
                    //in condition of not enough send error message
                    const log = new OrderLog()
                    log.orderId = order.id
                    log.command = ProcessCommand.RESERVE
                    log.processedAt =new Date()
                    console.log(`inventory attempt no : ${attempt}`)
                    if(attempt >= 6){
                        console.log(`inventory reservation retry reached maximum attempt, order status will be FAILED`)
                        await this.inventoryBrokerServices.emit('order_failed', {orderId:order.id,})
                        return;
                    }
                    console.log(`inventory transaction is started for orderId: ${order.id}`)
                    await this.inventoryRepository.manager.transaction( async (transactionalEntityManager:EntityManager)=>{
                        const inventory = await transactionalEntityManager.createQueryBuilder(Inventory, 'inventory').setLock('pessimistic_write').where('inventory.productId = :productId', {productId:order.product.id}).getOne()
                        if(!inventory){
                            return {error:`inventory for product id: ${order.product} not found`}
                        }
                        if(inventory.quantity >= order.quantity){
                            inventory.quantity -= order.quantity
                            await transactionalEntityManager.save(inventory)
                            log.status = ProcessStatus.SUCCESS
                            console.log(`product reservation done for orderId: ${order.id}`)
                            console.log(`event will be emitted for order_payment`)
                            await this.inventoryBrokerServices.emit('order_payment', {orderId:order.id, amount:order.quantity * order.product.price})
                            await this.orderLogRepository.save(log)
                            return;
                        }else{
                            log.errorMessage = `inventory quantity is not sufficient for orderId:${order.id}, quantity available: ${inventory.quantity}`
                            await this.orderLogRepository.save(log)
                            throw new Error(log.errorMessage )
                        }
                    })

                    console.log(`inventory reservation is done status: ${log.status}`)
                    return

                    // if (403 === res.status) {
                    //     // don't retry upon 403
                    //     bail(new Error('Unauthorized'));
                    //     return;
                    // }
                    // const data = await res.text();
                    // return data.substr(0, 500);
                },
                {
                    retries: 6,
                }
            );

        } catch (e) {
            return {error: e.message}
        }finally {

        }

    }
}
