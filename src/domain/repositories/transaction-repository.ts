import { TransactionRepository } from "../interfaces/repository/transaction-repository";
import { TransactionHistoryDataSource } from "../../data/interfaces/data-sources/TransactionHistoryDataSource";
import { TransactionHistoryRequestModel, TransactionHistoryResponseModel } from "../model/TransactionHistory";

export class TransactionRepositoryImpl implements TransactionRepository {
    transactionDataSource: TransactionHistoryDataSource
    constructor(transactionDataSource: TransactionHistoryDataSource) {
        this.transactionDataSource = transactionDataSource
    }

    async createTransaction(id: string, transaction: TransactionHistoryRequestModel) {
        await this.transactionDataSource.save(id, transaction)

    }
    async getTransactions(tokenId: string): Promise<TransactionHistoryResponseModel[] | null> {
        const result = await this.transactionDataSource.search(tokenId)
        return result;
    }
}