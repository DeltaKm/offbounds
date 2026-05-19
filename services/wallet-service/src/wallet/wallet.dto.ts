import { IsString, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateWalletDto {
  @IsString()
  userId: string;
}

export class DepositDto {
  @IsString()
  userId: string;

  @IsString()
  currency: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class WithdrawDto {
  @IsString()
  userId: string;

  @IsString()
  currency: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}

export class TransferDto {
  @IsString()
  fromUserId: string;

  @IsString()
  toUserId: string;

  @IsString()
  currency: string;

  @IsNumber()
  @IsPositive()
  amount: number;
}
