
import { NFTRepository } from "../interfaces/repository/nft-repository";
import { Web3Transaction } from "../../data/data-sources/blockchain/Web3Transaction";
import { NFTsDataSource } from "../../data/interfaces/data-sources/NFTsDataSource";


export class NFTRepositoryImpl implements NFTRepository {
    web3Transaction: Web3Transaction
    nftsDataSource: NFTsDataSource

    constructor(web3Transaction: Web3Transaction, nftsDataSource: NFTsDataSource) {
        this.web3Transaction = web3Transaction;
        this.nftsDataSource = nftsDataSource;
    }

    async createNFT(id: string, nft: any): Promise<any> {
        this.nftsDataSource.save(id, nft)
    }

    async getAllNfts(): Promise<any> {
       return await this.web3Transaction.getNfts()
    }
   
    async transferNFT(toAddress: string, tokenId: string, index: number): Promise<any> {
        this.web3Transaction.transferNFT(toAddress, tokenId, index)
    }
}