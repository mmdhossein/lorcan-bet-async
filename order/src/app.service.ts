import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_SERVICE') private orderBrokerServices: ClientKakfa, @InjectRepository(Order) private orderRepository: Repository<Order>) {}
  
  //when order is placed with pending status
  //then we emit new inventory event
  //once the inventory reserved the product or failed after multiple times, it emit event to order microservices to whether continue payment processing or emit event to release to product in the inventory
  async createOrder(newOrderDto:Order) {
    const log = new OrderLog()
    try{
    await this.orderRepository.save(newOrderDto)
    await this.orderBrokerServices.emit('inventory_new_order', order)
    log.status = LogStatus.SUCCESS
    }catch(e){
    log.status = LogStatus.FAILED
    log.errorMessage = e.message  
    }
    finally{
          await this.orderBrokerServices.emit('log_order', log)
    }
  }

 async  processOrderAfterInventory(){
    //decide to emit payment or emit release inventory
    //in case of payment it should call payment service in exponential backoff style and after any retry it should log the result in log order
   //once payment was done it should update order status to SUCCESS and after that call payment confirm
   ///in case of payment multiple failure it should update order status to FAILED
   //any retry should have order log
  }
  
 
}
