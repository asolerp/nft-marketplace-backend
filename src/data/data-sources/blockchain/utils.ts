import * as dotenv from 'dotenv'
dotenv.config()

import * as contract from './Contracts/CCNft.json'
import * as nftVendor from './Contracts/NftVendor.json'
import * as nftOffers from './Contracts/NftOffers.json'

const NETWORKS = {
  '1674378555800': 'Ganache',
}

const targetNetwork = process.env.PUBLIC_NETWORK_ID as keyof NETWORK

type NETWORK = typeof NETWORKS

export const contractAddress = contract.networks[targetNetwork]?.address
export const nftVendorAddress = nftVendor.networks[targetNetwork]?.address
export const nftOffersAddress = nftOffers.networks[targetNetwork]?.address

export const pinataApiKey = process.env.PINATA_API_KEY as string
export const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY as string
