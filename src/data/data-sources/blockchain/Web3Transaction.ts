import { isValidAddress } from 'ethereumjs-util'
import { Web3Repository } from './Web3Repository'

export class Web3Transaction extends Web3Repository {
  private async signTransaction(tx: any): Promise<any> {
    return await this.client().eth.accounts.signTransaction(
      tx,
      process.env.PRIVATE_KEY as string
    )
  }

  private async sendSignedTransaction(signedTx: any): Promise<any> {
    try {
      return await this.client().eth.sendSignedTransaction(
        signedTx.rawTransaction
      )
    } catch (e: any) {
      throw new Error('Sign Transaction fails')
    }
  }

  public async getNfts() {
    try {
      let initialNonce = null

      const nftContract = this.contract()

      if (!initialNonce) {
        initialNonce = await this.client().eth.getTransactionCount(
          process.env.PUBLIC_KEY as string,
          'latest'
        )
      }

      const nonce = initialNonce

      const tx = {
        gas: 4465030,
        nonce,
        data: nftContract.methods.getAllNFTs().encodeABI(),
      }

      const signedTx = await this.signTransaction(tx)
      const hash = await this.sendSignedTransaction(signedTx)

      return hash
    } catch (e: any) {
      console.error(e)
    }
  }

  public async transferNFT(toAddress: string, tokenId: string, index: number) {
    try {
      let initialNonce = null

      const nftContract = this.contract()

      if (!initialNonce) {
        initialNonce = await this.client().eth.getTransactionCount(
          process.env.PUBLIC_KEY as string,
          'latest'
        )
      }

      const nonce = initialNonce + index

      const tx = {
        from: process.env.PUBLIC_KEY,
        to: process.env.NFT_CONTRACT_ADDRESS,
        gas: 30000000,
        nonce,
        maxPriorityFeePerGas: 2999999987,
        value: 0,
        data: nftContract.methods
          .transferFrom(process.env.PUBLIC_KEY, toAddress, tokenId)
          .encodeABI(),
      }

      const signedTx = await this.signTransaction(tx)
      const hash = await this.sendSignedTransaction(signedTx)

      return hash
    } catch (e: any) {
      throw new Error('Transfer nft fails')
    }
  }

  public isValidAddress(address: string): boolean {
    return isValidAddress(address)
  }
}
