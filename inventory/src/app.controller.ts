import { Controller } from '@nestjs/common';
import { InventoryService } from './services/app.service';
import {EventPattern,} from "@nestjs/microservices";
import {IOrder} from "./interface/order.interface";

@Controller()
export class AppController {
  constructor(private readonly appService: InventoryService) {}
//this service needs to be on eventPattern and also it should have a retry mechanism, once the inventory reserved it should emit an event to the order service to continue the payment
  @EventPattern('inventory_new_order')
  reserveInventory(req:IOrder) {
    return this.appService.reserveInventory(req);
  }
}
