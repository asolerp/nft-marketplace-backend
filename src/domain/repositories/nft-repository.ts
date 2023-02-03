import { NFTRepository } from '../interfaces/repository/nft-repository'
import { Web3Transaction } from '../../data/data-sources/blockchain/Web3Transaction'
import { NFTsDataSource } from '../../data/interfaces/data-sources/NFTsDataSource'
import { Nft } from '../../types/nft'

export class NFTRepositoryImpl implements NFTRepository {
  web3Transaction: Web3Transaction
  nftsDataSource: NFTsDataSource

  constructor(
    web3Transaction: Web3Transaction,
    nftsDataSource: NFTsDataSource
  ) {
    this.web3Transaction = web3Transaction
    this.nftsDataSource = nftsDataSource
  }

  async createNFT(id: string, nft: any): Promise<any> {
    this.nftsDataSource.save(id, nft)
  }

  async getCaskInfo(caskId: string): Promise<any> {
    return await this.web3Transaction.getCaskInfo(caskId)
  }

  async getAllNfts(): Promise<any> {
    return await this.web3Transaction.getNfts()
  }

  async getOwnedNfts(owner: string): Promise<any> {
    return await this.web3Transaction.getOwnedNfts(owner)
  }

  async fractionalizeNft(fractionalizeInfo: any): Promise<void> {
    this.web3Transaction.fractionalizeNft({ fractionInfo: fractionalizeInfo })
  }

  async transferNFT(
    toAddress: string,
    tokenId: string,
    index: number
  ): Promise<any> {
    this.web3Transaction.transferNFT(toAddress, tokenId, index)
  }
}
