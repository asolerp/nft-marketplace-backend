import { TransactionHistoryRequestModel } from '../../../domain/model/TransactionHistory'
import { TransactionHistoryDataSource } from '../../interfaces/data-sources/TransactionHistoryDataSource'

import { MongoRepository } from './MongoRepository'

export class MongoDBTransactionHistoryDataSource
  extends MongoRepository
  implements TransactionHistoryDataSource
{
  protected collectionName(): string {
    return 'transactions'
  }

  public async save(id: string, transaction: TransactionHistoryRequestModel) {
    await this.persist(id, transaction)
  }

  public async search(tokenId: string): Promise<any | null> {
    const collection = await this.collection()
    const document = await collection.find<any>({ tokenId: tokenId }).toArray()

    return document || null
  }
}
