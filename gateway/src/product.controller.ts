import {Body, Controller, Get, Inject, Post} from '@nestjs/common';
import { ProductService } from './services/product.service';
import {IProduct} from "./services/interfaces/product.interface";
import {ClientKafka} from "@nestjs/microservices";
import {ApiBody} from "@nestjs/swagger";
import {CreateProductDto} from "./services/dtos/product.dto";
import {Kafka} from "kafkajs";

@Controller('product')
export class ProductController {
  admin
  constructor(private readonly appService: ProductService,
              @Inject('GATEWAY_SERVICE') private readonly client:ClientKafka) {}

  // async onApplicationBootstrap(){
  //   this.client.subscribeToResponseOf('product_create')
  //   await this.client.connect()
  // }

  async onModuleInit() {
    this.client.subscribeToResponseOf('product_create');
    const kafka = new Kafka({
      clientId: 'gateway',
      brokers: [process.env.KAFKA_HOST],
    });
    this.admin = kafka.admin();
    // get list of topics
    const topics = await this.admin.listTopics();
    console.log("TOPICS: ", topics)
    // or create new topic
    await this.admin.createTopics({
      topics: [{
        topic: 'gateway-group',
        numPartitions: 1,
        replicationFactor: 1,
      },{
        topic: 'product-group',
        numPartitions: 1,
        replicationFactor: 1,
      }],
    });
    await this.client.connect()
  }


  @Post()
  // @ApiBearerAuth('authorization')
  // @ApiOkResponse({status:201})
  @ApiBody({
    type:CreateProductDto })
  async createProduct(@Body() req: IProduct) {
    return await this.appService.createProduct(req);
  }
}
