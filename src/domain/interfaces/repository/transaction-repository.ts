// domain/interfaces/repositories/contact-repository.ts
import {
  TransactionHistoryRequestModel,
  TransactionHistoryResponseModel,
} from '../../model/TransactionHistory'

export interface TransactionRepository {
  createTransaction(
    id: string,
    transaction: TransactionHistoryRequestModel
  ): Promise<void>
  // deleteTransaction(id: String): void;
  // updateTransaction(id: String, data: TransactionHistoryRequestModel): void;
  getTransactions(
    tokenId: string
  ): Promise<TransactionHistoryResponseModel[] | null>
  // getTransaction(id: String): Promise<TransactionHistoryResponseModel | null>;
}
