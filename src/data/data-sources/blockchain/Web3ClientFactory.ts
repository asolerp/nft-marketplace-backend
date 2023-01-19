import * as dotenv from 'dotenv'
dotenv.config()

import { Contract } from 'ethers'
import Web3 from 'web3'
const { MNEMONIC } = process.env

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HDWalletProvider = require('@truffle/hdwallet-provider')

type Web3Contract = {
  contractAddress: string
  contractABI: any
}

export class Web3ClientFactory {
  private static clients: { [key: string]: Web3 } = {}
  private static wsClients: { [key: string]: Web3 } = {}

  private static contract: any

  static createClient(
    contextName: string,
    url: any,
    ws: string,
    contractData: Web3Contract
  ): any {
    let client = Web3ClientFactory.getClient(contextName)
    let wsClient = Web3ClientFactory.getWsClient(contextName)

    try {
      if (!wsClient) {
        wsClient = Web3ClientFactory.createWebsocketProvider(ws)
        Web3ClientFactory.registerWsClient(wsClient, contextName)
      }

      if (!client) {
        client = Web3ClientFactory.createAndConnectClient(url)
        Web3ClientFactory.registerClient(client, contextName)
        Web3ClientFactory.createContract(contextName, contractData)
      }
    } catch (e: any) {
      console.error(e)
    }

    return {
      client,
      wsClient,
    }
  }

  static createContract(
    contextName: string,
    contractData: Web3Contract
  ): Contract {
    let contract = Web3ClientFactory.getContract()
    if (!contract) {
      contract = Web3ClientFactory.setContract(
        contextName,
        contractData.contractAddress,
        contractData.contractABI
      )
    }

    return contract
  }

  private static getClient(contextName: string): Web3 {
    return Web3ClientFactory.clients[contextName]
  }

  private static getWsClient(contextName: string): Web3 {
    return Web3ClientFactory.wsClients[contextName]
  }

  private static setContract(
    contextName: string,
    contractAddress: string,
    contractABI: any
  ) {
    Web3ClientFactory.contract = new Web3ClientFactory.clients[
      contextName
    ].eth.Contract(contractABI, contractAddress)
  }

  static getContract() {
    return Web3ClientFactory.contract
  }

  private static createWebsocketProvider(ws: any): Web3 {
    const client = new Web3(ws)
    return client
  }

  private static createAndConnectClient(url: any): Web3 {
    const client = new Web3(new HDWalletProvider(MNEMONIC, url, 0, 5))
    return client
  }

  private static registerClient(client: Web3, contextName: string): void {
    Web3ClientFactory.clients[contextName] = client
  }

  private static registerWsClient(client: Web3, contextName: string): void {
    Web3ClientFactory.wsClients[contextName] = client
  }
}
