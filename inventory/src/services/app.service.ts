import { Injectable } from '@nestjs/common';

@Injectable()
export class InventoryService {
    constructor(@InjectRepository(Inventory) private inventoryRepository: Repository<Inventory>,
                @InjectRepository(OrderLog) private orderLogRepository: Repository<OrderLog>, @Inject('INVENTORY_SERVICE') private inventoryBrokerServices: ClientKakfa) {

    }
  
  //this should be transactional
//todo this should run in async retry manner? package: async-retry
    //to handle idempotent operations, we need to introduce command field in "order log", once reserve product event reached inventory, we check that can we find a record where: {command:RESERVE, status:SUCCESS}
    //if there was a record we don't need to process it but, inventory needs to emit to order microservice that should resume payment
    //we will do the same in payment microservice we again check {command:PAY, status:SUCCESS} in our records to find out should we need to process payment or not
     async reserveInventory(productId:number, quantity:number, orderId:number) {
        try {

          const inventoryProcess = await this.orderLogRepository.find({where:{command:ProcessCommand.RESERVE, status:ProcessStatus.SUCCESS, orderId:orderId}})
           if(inventoryProcess){
               console.log(`found duplicate inventory reservation request for orderId: ${orderId}`)
               await this.inventoryBrokerServices.emit('order_payment_new', {orderId})
               return;
           }
          //check inventory if we have enough quantity and deduce it, can you do it as a procedure or transactional
          //in condition of not enough send error message
          await this.inventoryRepository.manager.transaction( async (tranasctionalEntityManager:EntityManager)=>{
            const inventory = await tranasctionalEntityManager.createQueryBuilder(Inventory, 'inventory').setLocak('pessimistic_write').where('inventory.productId = :productId', {productId}).getOne()
            if(!inventory){
              return {error:`inventory for product id: ${productId} not found`}
            }
            if(inventory.quantity >= quantity){
              inventory.quantity -= quantity
              await tranasctionalEntityManager.save(inventory)
              console.log(`product reservation done for orderId: ${orderId}`)
              console.log(`event will be emitted for order_payment_new`)
              await this.inventoryBrokerServices.emit('order_payment_new', {orderId})
               return;
            }else{
              return {error:`inventory quantity is not sufficient, quantity available: ${inventory.quantity}`}
            }
          })
        
            console.log('reserveInventory')
            return result
        } catch (e) {
            return {error: e.message}
        }

    }
}
