import { Injectable } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(@Inject('ORDER_SERVICE') private orderBrokerServices: ClientKakfa, @InjectRepository(Order) private orderRepository: Repository<Order>) {}
  
  
  createOrder(newOrderDto:Order) {
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
}
