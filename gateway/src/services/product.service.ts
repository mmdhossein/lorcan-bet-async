import {Inject, Injectable} from '@nestjs/common';
import {ClientKafka} from "@nestjs/microservices";
import {IProduct} from "./interfaces/product.interface";

@Injectable()
export class ProductService {
  constructor(@Inject('GATEWAY_SERVICE') private readonly gatewayService:ClientKafka) {
  }
  async createProduct(req:IProduct) {
    return  this.gatewayService.send('product_create', req)
  }
}
