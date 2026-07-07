import { PrismaService } from '../prisma/prisma.service';
export declare class WalletService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createWallet(userId: string): Promise<any>;
    getBalance(userId: string): Promise<{
        userId: any;
        balances: any;
    }>;
    deposit(userId: string, currency: string, amount: number): Promise<{
        success: boolean;
        newBalance: any;
    }>;
    withdraw(userId: string, currency: string, amount: number): Promise<{
        success: boolean;
        newBalance: any;
    }>;
    transfer(fromUserId: string, toUserId: string, currency: string, amount: number): Promise<{
        success: boolean;
    }>;
    getTransactions(userId: string, limit: number, offset: number): Promise<any>;
    purchaseStars(userId: string, starsAmount: number, provider: string, providerTxId?: string): Promise<any>;
    confirmPurchase(purchaseId: string): Promise<{
        success: boolean;
    }>;
    addCreatorEarnings(userId: string, starsAmount: number): Promise<any>;
    getCreatorEarnings(userId: string): Promise<{
        totalEarned: any;
        available: any;
        pending: any;
        currency: any;
    }>;
    requestPayout(userId: string, amount: number, method: string, destination: string): Promise<any>;
    getPayoutRequests(userId: string): Promise<any>;
    processPayout(payoutId: string, adminUserId: string): Promise<{
        success: boolean;
    }>;
}
