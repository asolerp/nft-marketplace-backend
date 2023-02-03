import axios from 'axios'
import { isValidAddress } from 'ethereumjs-util'
import { ethers } from 'ethers'

import NftFractionTokenABI from './contracts/NftFractionTokenABI.json'
import { Web3Repository } from './Web3Repository'

const nullAddress = '0x0000000000000000000000000000000000000000'

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

  public async getCaskInfo(caskId: string) {
    try {
      console.log(caskId)
      const CCNft = this.contracts()['CCNft']
      const NftVendor = this.contracts()['NftVendor']
      const NftOffers = this.contracts()['NftOffers']

      const nft = await CCNft.methods.getNftInfo(caskId).call()
      const tokenURI = await CCNft.methods!.tokenURI(caskId).call()
      const owner = await CCNft.methods.ownerOf(caskId).call()
      const meta = await axios
        .get(tokenURI, {
          headers: {
            'x-pinata-gateway-token': process.env.PINATA_GATEWAY_TOKEN,
          },
        })
        .then((res) => {
          return res.data
        })
        .catch(() => {
          return {
            description:
              'El secreto de su exquisita calidad descansa en el tiempo, el silencio y el microclima de nuestras bodegas subterráneas acorazadas por un muro de un metro y ochenta centímetros intraspasable por los olores y los ruidos.',
            image:
              'https://gateway.pinata.cloud/ipfs/QmNqh9WW1qmzU9CtD6ZjtvD9P2ZQJTbUU7SDjwEDnpFJni',
            name: 'Classic Cask Brandy Suau SIN INFO',
            attributes: [
              { trait_type: 'year', value: '1990' },
              { trait_type: 'extractions', value: '0' },
              { trait_type: 'country', value: 'Spain' },
              { trait_type: 'region', value: 'Balearic Islands' },
            ],
          }
        })

      const listedPrice = await NftVendor.methods.getListing(nft.tokenId).call()
      const offer = await NftOffers.methods.getNftOffer(nft.tokenId).call()
      let bidders

      if (offer?.nftId != 0) {
        bidders = await NftOffers.methods.getAddressesBids(offer?.nftId).call()
      }
      const cask = {
        tokenId: nft.tokenId,
        creator: nft.creator,
        owner,
        price: listedPrice?.price?.toString(),
        offer:
          offer?.nftId != 0
            ? {
                bid: offer?.highestBid?.toString(),
                highestBidder: offer?.highestBidder,
                bidders,
              }
            : null,
        meta,
      }
      return cask
    } catch (e: any) {
      console.log('Error', e)
    }
  }

  public async getNfts() {
    try {
      const client = this.client()

      const CCNft = this.contracts()['CCNft']
      const NftVendor = this.contracts()['NftVendor']
      const NftOffers = this.contracts()['NftOffers']
      const NftFractionsFactory = this.contracts()['NftFractionsFactory']

      const listNfts = await CCNft.methods.getAllNFTs().call()

      const nfts = await Promise.all(
        listNfts.map(async function (nft: any) {
          let fractionTokenContract
          const fractionTokenAddress = await NftFractionsFactory.methods
            .getVaultContractByTokenId(nft.tokenId)
            .call()

          if (fractionTokenAddress !== nullAddress) {
            fractionTokenContract = new client.eth.Contract(
              NftFractionTokenABI as any,
              fractionTokenAddress
            )
          }

          const totalFractions =
            fractionTokenContract &&
            (await fractionTokenContract?.methods?.totalSupply().call())

          const tokenURI = await CCNft.methods!.tokenURI(nft.tokenId).call()
          const owner = await CCNft.methods.ownerOf(nft.tokenId).call()
          const meta = await axios
            .get(tokenURI, {
              headers: {
                'x-pinata-gateway-token': process.env.PINATA_GATEWAY_TOKEN,
              },
            })
            .then((res) => {
              return res.data
            })
            .catch(() => {
              return {
                description:
                  'El secreto de su exquisita calidad descansa en el tiempo, el silencio y el microclima de nuestras bodegas subterráneas acorazadas por un muro de un metro y ochenta centímetros intraspasable por los olores y los ruidos.',
                image:
                  'https://gateway.pinata.cloud/ipfs/QmNqh9WW1qmzU9CtD6ZjtvD9P2ZQJTbUU7SDjwEDnpFJni',
                name: 'Classic Cask Brandy Suau SIN INFO',
                attributes: [
                  { trait_type: 'year', value: '1990' },
                  { trait_type: 'extractions', value: '0' },
                  { trait_type: 'country', value: 'Spain' },
                  { trait_type: 'region', value: 'Balearic Islands' },
                ],
              }
            })
          const listedPrice = await NftVendor.methods
            .getListing(nft.tokenId)
            .call()
          const offer = await NftOffers.methods.getNftOffer(nft.tokenId).call()
          let bidders

          if (offer?.nftId != 0) {
            bidders = await NftOffers.methods
              .getAddressesBids(offer?.nftId)
              .call()
          }

          return {
            tokenId: nft.tokenId,
            creator: nft.creator,
            fractions: totalFractions
              ? {
                  total: Number(
                    ethers.utils.formatEther(totalFractions.toString())
                  ),
                }
              : null,
            owner,
            price: listedPrice?.price?.toString(),
            offer:
              offer?.nftId != 0
                ? {
                    bid: offer?.highestBid?.toString(),
                    highestBidder: offer?.highestBidder,
                    bidders,
                  }
                : null,
            meta,
          }
        })
      )

      return nfts
    } catch (e: any) {
      console.error(e)
    }
  }

  public async getOwnedNfts(account: string) {
    try {
      const client = this.client()
      const CCNft = this.contracts()['CCNft']
      const NftVendor = this.contracts()['NftVendor']
      const NftOffers = this.contracts()['NftOffers']
      const NftFractionsFactory = this.contracts()['NftFractionsFactory']

      const listNfts = await CCNft.methods
        .getOwnedNfts()
        .call({ from: account })

      const nfts = await Promise.all(
        listNfts.map(async function (nft: any) {
          let fractionTokenContract
          const fractionTokenAddress = await NftFractionsFactory.methods
            .getVaultContractByTokenId(nft.tokenId)
            .call()

          if (fractionTokenAddress !== nullAddress) {
            fractionTokenContract = new client.eth.Contract(
              NftFractionTokenABI as any,
              fractionTokenAddress
            )
          }

          const totalFractions =
            fractionTokenContract &&
            (await fractionTokenContract?.methods?.totalSupply().call())

          const tokenURI = await CCNft.methods!.tokenURI(nft.tokenId).call()
          const owner = await CCNft.methods.ownerOf(nft.tokenId).call()
          const meta = await axios
            .get(tokenURI, {
              headers: {
                'x-pinata-gateway-token': process.env.PINATA_GATEWAY_TOKEN,
              },
            })
            .then((res) => {
              return res.data
            })
            .catch(() => {
              return {
                description:
                  'El secreto de su exquisita calidad descansa en el tiempo, el silencio y el microclima de nuestras bodegas subterráneas acorazadas por un muro de un metro y ochenta centímetros intraspasable por los olores y los ruidos.',
                image:
                  'https://gateway.pinata.cloud/ipfs/QmNqh9WW1qmzU9CtD6ZjtvD9P2ZQJTbUU7SDjwEDnpFJni',
                name: 'Classic Cask Brandy Suau SIN INFO',
                attributes: [
                  { trait_type: 'year', value: '1990' },
                  { trait_type: 'extractions', value: '0' },
                  { trait_type: 'country', value: 'Spain' },
                  { trait_type: 'region', value: 'Balearic Islands' },
                ],
              }
            })
          const listedPrice = await NftVendor.methods
            .getListing(nft.tokenId)
            .call()
          const offer = await NftOffers.methods.getNftOffer(nft.tokenId).call()
          let bidders

          if (offer?.nftId != 0) {
            bidders = await NftOffers.methods
              .getAddressesBids(offer?.nftId)
              .call()
          }

          return {
            tokenId: nft.tokenId,
            creator: nft.creator,
            fractions: totalFractions
              ? {
                  total: Number(
                    ethers.utils.formatEther(totalFractions.toString())
                  ),
                }
              : null,
            owner,
            price: listedPrice?.price?.toString(),
            offer:
              offer?.nftId != 0
                ? {
                    bid: offer?.highestBid?.toString(),
                    highestBidder: offer?.highestBidder,
                    bidders,
                  }
                : null,
            meta,
          }
        })
      )

      return nfts
    } catch (e: any) {
      console.error(e)
    }
  }

  public async fractionalizeNft({ fractionInfo }: { fractionInfo: any }) {
    try {
      let initialNonce = null

      const { name, symbol, collection, tokenId, supply, listPrice } =
        fractionInfo

      console.log('INFO', {
        name,
        symbol,
        collection,
        tokenId,
        supply,
        listPrice,
      })

      const nftFractionsFactoryContract =
        this.contracts()['NftFractionsFactory']

      if (!initialNonce) {
        initialNonce = await this.client().eth.getTransactionCount(
          process.env.PUBLIC_KEY as string,
          'latest'
        )
      }

      const nonce = initialNonce

      const tx = {
        from: process.env.PUBLIC_KEY,
        to: process.env.NFT_FRACTION_FACTORY_ADDRES,
        gas: 30000000,
        nonce,
        maxPriorityFeePerGas: 2999999987,
        value: 0,
        data: nftFractionsFactoryContract.methods
          .mint(name, symbol, collection, tokenId, supply, listPrice)
          .encodeABI(),
      }

      const signedTx = await this.signTransaction(tx)
      const hash = await this.sendSignedTransaction(signedTx)

      console.log('HASH', hash)

      return hash
    } catch (e: any) {
      console.log('Error', e)
    }
  }

  public async transferNFT(toAddress: string, tokenId: string, index: number) {
    try {
      let initialNonce = null

      const nftContract = this.contracts()['CCNft']

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
