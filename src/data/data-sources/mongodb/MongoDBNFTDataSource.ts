import { NFTRequestModel } from '../../../domain/model/NFT'
import { TransactionHistoryRequestModel } from '../../../domain/model/TransactionHistory'
import { NFTsDataSource } from '../../interfaces/data-sources/NFTsDataSource'

import { MongoRepository } from './MongoRepository'

export class MongoDBNFTDataSource
  extends MongoRepository
  implements NFTsDataSource
{
  protected collectionName(): string {
    return 'nfts'
  }

  public async save(id: string, nft: NFTRequestModel) {
    await this.persist(id, nft)
  }

  public async search(tokenId: string): Promise<any | null> {
    const collection = await this.collection()
    const document = await collection.find<any>({ tokenId: tokenId }).toArray()

    return document || null
  }
}
