import { WalletService } from './wallet.service';
import { CreateWalletDto, DepositDto, WithdrawDto, TransferDto } from './wallet.dto';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    createWallet(dto: CreateWalletDto): Promise<any>;
    getBalance(userId: string): Promise<{
        userId: any;
        balances: any;
    }>;
    deposit(dto: DepositDto): Promise<{
        success: boolean;
        newBalance: any;
    }>;
    withdraw(dto: WithdrawDto): Promise<{
        success: boolean;
        newBalance: any;
    }>;
    transfer(dto: TransferDto): Promise<{
        success: boolean;
    }>;
    getTransactions(userId: string, limit?: string, offset?: string): Promise<any>;
}
