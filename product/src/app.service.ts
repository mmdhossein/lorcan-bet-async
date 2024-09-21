import { Injectable } from '@nestjs/common';
import {Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";
import {Product} from "./entities/product.entity";

@Injectable()
export class AppService {

  constructor(@InjectRepository(Product) private productRepository: Repository<Product>,) {
  }
  async createProduct(newProduct:Product) :Promise<Product>{
    const result =  await this.productRepository.save(newProduct)
    console.log('saved product: ', result)
    return result

  }
}
