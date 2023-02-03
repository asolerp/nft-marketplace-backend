import { Nft } from '../../../types/nft'

export interface NFTRepository {
  createNFT(id: string, nft: any): Promise<any>
  getAllNfts(): Promise<Nft[]>
  getOwnedNfts(owner: string): Promise<Nft[]>
  getCaskInfo(caskId: string): Promise<Nft>
  fractionalizeNft(fractionalizeInfo: any): Promise<void>
  transferNFT(toAddress: string, tokenId: any, index: number): Promise<void>
}
