import {Module} from '@nestjs/common';
import {ProductController} from './product.controller';
import {ProductService} from './services/product.service';
import {ClientsModule, Transport} from '@nestjs/microservices';
import {ConfigModule, ConfigService,} from "@nestjs/config";
import {ClientsProviderAsyncOptions} from "@nestjs/microservices/module/interfaces/clients-module.interface";
import {ClientsModuleAsyncOptions} from "@nestjs/microservices/module/interfaces";

@Module({
  imports: [  ConfigModule.forRoot({
    envFilePath: './config/.env.dev',isGlobal:true
  }), ClientsModule.registerAsync({clients:[{inject:[ConfigService], imports:[ConfigModule], name:"GATEWAY_SERVICE"
  ,useFactory:(configService: ConfigService)=>({name:"GATEWAY_SERVICE",
        transport:Transport.KAFKA,
            options:{client:{clientId:'gateway',
                      brokers:[ configService.get<string>('KAFKA_HOST')],},consumer:{groupId:'gateway-group'},}})//producer:{createPartitioner()}
  }] as Array<ClientsProviderAsyncOptions>} as ClientsModuleAsyncOptions)],
  controllers: [ProductController],
  providers: [ProductService, ],
})
export class AppModule {}