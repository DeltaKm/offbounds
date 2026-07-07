export declare class CreateWalletDto {
    userId: string;
}
export declare class DepositDto {
    userId: string;
    currency: string;
    amount: number;
}
export declare class WithdrawDto {
    userId: string;
    currency: string;
    amount: number;
}
export declare class TransferDto {
    fromUserId: string;
    toUserId: string;
    currency: string;
    amount: number;
}
