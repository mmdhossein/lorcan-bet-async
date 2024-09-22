import { Controller } from '@nestjs/common';
import { PaymentService } from './app.service';
import {MessagePattern} from "@nestjs/microservices";

@Controller()
export class PaymentController {
  constructor(private readonly appService: PaymentService) {}

  @MessagePattern('payment_create')
  payment(payment:{orderId:number, amount:number}): Promise<{ error: string } | string> {
    return this.appService.processPayment(payment.orderId, payment.amount);
  }
  @MessagePattern('payment_inquiry')
  inquiry(orderId:number) {
    return this.appService.paymentInquiry(orderId);
  }

}
