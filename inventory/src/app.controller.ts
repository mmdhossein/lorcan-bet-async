import { Controller, Get } from '@nestjs/common';
import { AppService } from './services/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
//this service needs to be on eventPattern and also it should have a retry mechanism, once the inventory reserved it should emit an event to the order service to continue the payment
  @EventPattern('inventory_new_order')
  reserveInventory(req) {
    return this.appService.reserveInventory();
  }
}
