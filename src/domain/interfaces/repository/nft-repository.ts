export interface NFTRepository {
  createNFT(id: string, nft: any): Promise<any>
  getAllNfts(): Promise<any>
  transferNFT(toAddress: string, tokenId: any, index: number): Promise<void>
}
