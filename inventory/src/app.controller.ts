import { Controller, Get } from '@nestjs/common';
import { InventoryService } from './services/app.service';
import {EventPattern, MessagePattern} from "@nestjs/microservices";

@Controller()
export class AppController {
  constructor(private readonly appService: InventoryService) {}
//this service needs to be on eventPattern and also it should have a retry mechanism, once the inventory reserved it should emit an event to the order service to continue the payment
  @EventPattern('inventory_new_order')
  reserveInventory(req:{productId:number, quantity:number, orderId:number}) {
    return this.appService.reserveInventory(req);
  }
}
