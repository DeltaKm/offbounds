import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { EpochService } from './epoch.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('epoch')
export class EpochController {
  constructor(private readonly epochService: EpochService) {}

  @Post('payment')
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.epochService.createPayment(
      dto.userId,
      dto.starsAmount,
      dto.returnUrl,
      dto.cancelUrl,
    );
  }

  @Post('webhook')
  async handleWebhook(
    @Body() payload: unknown,
    @Headers('x-epoch-signature') signature: string,
  ) {
    const payloadString = JSON.stringify(payload);
    const isValid = await this.epochService.verifyWebhookSignature(payloadString, signature);

    if (!isValid) {
      throw new BadRequestException('Invalid webhook signature');
    }

    await this.epochService.handleWebhook(payload as never);
    return { success: true };
  }
}
