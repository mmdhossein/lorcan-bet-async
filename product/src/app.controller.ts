import {Controller, Get, Post} from '@nestjs/common';
import { AppService } from './app.service';
import {Product} from "./entities/product.entity";
import {Ctx, EventPattern, MessagePattern, Payload, RmqContext} from "@nestjs/microservices";
@Controller('product')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern('product_create')
  createProduct(newProduct:Product) {
    console.log("received request: ",newProduct )
    return this.appService.createProduct(newProduct);
  }
}
