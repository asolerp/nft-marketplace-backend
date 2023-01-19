import * as dotenv from 'dotenv'
dotenv.config()

import * as contract from './NftMarket.json'

const NETWORKS = {
  '5777': 'Ganache',
}

type NETWORK = typeof NETWORKS

const targetNetwork = process.env.PUBLIC_NETWORK_ID as keyof NETWORK

export const contractAddress = contract.networks[targetNetwork].address

export const pinataApiKey = process.env.PINATA_API_KEY as string
export const pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY as string
