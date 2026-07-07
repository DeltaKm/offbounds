import { IsString, IsNumber, IsUrl } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  userId: string;

  @IsNumber()
  starsAmount: number;

  @IsUrl()
  returnUrl: string;

  @IsUrl()
  cancelUrl: string;
}
