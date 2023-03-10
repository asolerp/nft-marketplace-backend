import { Web3ClientFactory } from './data/data-sources/blockchain/Web3ClientFactory'
import { Web3Transaction } from './data/data-sources/blockchain/Web3Transaction'
import { MongoClientFactory } from './data/data-sources/mongodb/MongoClientFactory'

import { MongoDBRecordPaymentsDataSource } from './data/data-sources/mongodb/MongoDBRecordPaymentsDataSource'
import { MongoDBTransactionHistoryDataSource } from './data/data-sources/mongodb/MongoDBTransactionHistoryDataSource'
import { stripeConnection } from './data/payments/StripeConnection'

import { PaymentsRepositoryImpl } from './domain/repositories/payments-repository'
import { RecordPaymentsImpl } from './domain/repositories/record-payments-repository'
import { NFTRepositoryImpl } from './domain/repositories/nft-repository'
import { TransactionRepositoryImpl } from './domain/repositories/transaction-repository'
import { SendBougthNFT } from './domain/use-cases/nft/send-bought-nft'
import { CreateCheckoutSession } from './domain/use-cases/payments/create-checkout-session'
import { GetPaymentByPaymentId } from './domain/use-cases/payments/get-payment-by-payment-id'
import { RecordInitPayment } from './domain/use-cases/payments/record-init-payment'
import { CreateTransaction } from './domain/use-cases/transaction/create-transaction'
import { GetTransactionByTokenId } from './domain/use-cases/transaction/get-transaction-by-token-id-use-case'
import CreateCheckoutSessionRouter from './presentation/routers/create-checkout-session'
import OrderBottleRouter from './presentation/routers/order-bottle'
import TransactionsHistoryRouter from './presentation/routers/transactions-history-router'
import VerifyImageRouter from './presentation/routers/verify-image-router'
import VerifyRouter from './presentation/routers/verify-router'
import WebhookRouter from './presentation/routers/webhook'
import server from './server'
import CCNftABI from './data/data-sources/blockchain/Contracts/CCNftABI.json'
import NftVendorABI from './data/data-sources/blockchain/Contracts/NftVendorABI.json'
import NftOffersABI from './data/data-sources/blockchain/Contracts/NftOffersABI.json'
import NftFractionsFactoryABI from './data/data-sources/blockchain/Contracts/NftFractionsFactoryABI.json'
import NftFractionsVendorABI from './data/data-sources/blockchain/Contracts/NftFractionsVendorABI.json'
import { Web3Events } from './data/data-sources/blockchain/Web3Events'
import OnTransfer from './presentation/subscriptions/on-transfer'
import SignatureRouter from './presentation/routers/signature'
import GetNftsRouter from './presentation/routers/get-nfts'
import { GetNFTs } from './domain/use-cases/nft/get-nfts'
import { MongoDBNFTDataSource } from './data/data-sources/mongodb/MongoDBNFTDataSource'
import UserRouter from './presentation/routers/user-router'
import { GetUser } from './domain/use-cases/user/get-user'
import { UserRepositoryImpl } from './domain/repositories/user-repository'
import { MongoDBUserDataSource } from './data/data-sources/mongodb/MongoDBUserDataSource'
import { CreateUser } from './domain/use-cases/user/create-user'
import { GetRefreshTokens } from './domain/use-cases/user/get-refresh-tokens'
import { RefreshTokensRepositoryImpl } from './domain/repositories/refresh-tokens-repository'
import { MongoDBRefreshTokensDataSource } from './data/data-sources/mongodb/MongoDBRefreshTokensDataSource'
import { AddRefreshTokens } from './domain/use-cases/user/add-refresh-token'
import { DeleteTokens } from './domain/use-cases/user/delete-tokens'
import { UpdatePaymentStatus } from './domain/use-cases/payments/update-payment-status'
import { GetCaskInfo } from './domain/use-cases/nft/get-cask-info'
import { FractionalizeNft } from './domain/use-cases/nft/fractionalize-nft'
import OnOffer from './presentation/subscriptions/on-offer'
import { RecordOffer } from './domain/use-cases/offer/record-offer'
import { OfferImpl } from './domain/repositories/offer-repository'
import { MongoDBOfferDataSource } from './data/data-sources/mongodb/MongoDBOfferDataSource'
import { GetOwnedNFTs } from './domain/use-cases/nft/get-owned-nfts'
import OffersRouter from './presentation/routers/offers-router'
import { GetOffers } from './domain/use-cases/offer/get-offers'
import { RecordOfferImpl } from './domain/repositories/record-offer-repository'
;(async () => {
  const clientDB = MongoClientFactory.createClient(
    process.env.CONTEXT_NAME as string,
    {
      url: process.env.MONGO_DB_URL,
    }
  )

  const { client: web3Client, wsClient: web3WsClient } =
    Web3ClientFactory.createClient(
      process.env.CONTEXT_NAME as string,
      process.env.BLOCKCHAIN_URL as string,
      process.env.BLOCKCHAIN_WS_URL as string,
      [
        {
          contractName: 'CCNft',
          contractAddress: process.env.NFT_CONTRACT_ADDRESS as string,
          contractABI: CCNftABI,
        },
        {
          contractName: 'NftVendor',
          contractAddress: process.env.NFT_VENDOR_ADDRESS as string,
          contractABI: NftVendorABI,
        },
        {
          contractName: 'NftOffers',
          contractAddress: process.env.NFT_OFFERS_ADDRESS as string,
          contractABI: NftOffersABI,
        },
        {
          contractName: 'NftFractionsFactory',
          contractAddress: process.env.NFT_FRACTION_FACTORY_ADDRES as string,
          contractABI: NftFractionsFactoryABI,
        },
        {
          contractName: 'NftFractionsVendor',
          contractAddress: process.env.NFT_FRACTION_VENDOR as string,
          contractABI: NftFractionsVendorABI,
        },
      ]
    )

  const web3Contracts = Web3ClientFactory.getContracts()

  const eventsHandler = new Web3Events(web3Client, web3WsClient, web3Contracts)

  const payments = stripeConnection()

  const user = UserRouter(
    new GetUser(new UserRepositoryImpl(new MongoDBUserDataSource(clientDB))),
    new CreateUser(new UserRepositoryImpl(new MongoDBUserDataSource(clientDB))),
    new GetRefreshTokens(
      new RefreshTokensRepositoryImpl(
        new MongoDBRefreshTokensDataSource(clientDB)
      )
    ),
    new AddRefreshTokens(
      new RefreshTokensRepositoryImpl(
        new MongoDBRefreshTokensDataSource(clientDB)
      )
    ),
    new DeleteTokens(
      new RefreshTokensRepositoryImpl(
        new MongoDBRefreshTokensDataSource(clientDB)
      )
    )
  )
  const verifyMiddleWare = VerifyRouter()
  const verifyImageMiddleWare = VerifyImageRouter()
  const signature = SignatureRouter()
  const orderBottleMiddleWare = OrderBottleRouter()
  const transactionsHistory = TransactionsHistoryRouter(
    new GetTransactionByTokenId(
      new TransactionRepositoryImpl(
        new MongoDBTransactionHistoryDataSource(clientDB)
      )
    )
  )
  const createCheckoutSession = CreateCheckoutSessionRouter(
    new CreateCheckoutSession(new PaymentsRepositoryImpl(payments)),
    new RecordInitPayment(
      new RecordPaymentsImpl(new MongoDBRecordPaymentsDataSource(clientDB))
    )
  )
  const getNFTs = GetNftsRouter(
    new GetNFTs(
      new NFTRepositoryImpl(
        new Web3Transaction(web3Client, web3WsClient, web3Contracts),
        new MongoDBNFTDataSource(clientDB)
      )
    ),
    new GetCaskInfo(
      new NFTRepositoryImpl(
        new Web3Transaction(web3Client, web3WsClient, web3Contracts),
        new MongoDBNFTDataSource(clientDB)
      )
    ),
    new GetOwnedNFTs(
      new NFTRepositoryImpl(
        new Web3Transaction(web3Client, web3WsClient, web3Contracts),
        new MongoDBNFTDataSource(clientDB)
      )
    ),
    new FractionalizeNft(
      new NFTRepositoryImpl(
        new Web3Transaction(web3Client, web3WsClient, web3Contracts),
        new MongoDBNFTDataSource(clientDB)
      )
    )
  )

  const offers = OffersRouter(
    new GetOffers(new OfferImpl(new MongoDBOfferDataSource(clientDB)))
  )

  const webhook = WebhookRouter(
    new GetPaymentByPaymentId(
      new RecordPaymentsImpl(new MongoDBRecordPaymentsDataSource(clientDB))
    ),
    new SendBougthNFT(
      new NFTRepositoryImpl(
        new Web3Transaction(web3Client, web3WsClient, web3Contracts),
        new MongoDBNFTDataSource(clientDB)
      )
    ),
    new UpdatePaymentStatus(
      new RecordPaymentsImpl(new MongoDBRecordPaymentsDataSource(clientDB))
    )
  )

  const handleOnTransfer = OnTransfer(
    new CreateTransaction(
      new TransactionRepositoryImpl(
        new MongoDBTransactionHistoryDataSource(clientDB)
      )
    )
  )

  const handleOnNewOffer = OnOffer(
    new RecordOffer(new RecordOfferImpl(new MongoDBOfferDataSource(clientDB)))
  )

  eventsHandler.subscribeLogEvent('CCNft', 'Mint')
  eventsHandler.subscribeLogEvent('CCNft', 'Approval')

  eventsHandler.subscribeLogEvent('NftVendor', 'ItemBought', handleOnTransfer)

  eventsHandler.subscribeLogEvent('NftOffers', 'NewOffer', handleOnNewOffer)

  server.use('/api/user', user)
  server.use('/api/signature', signature)
  server.use('/api/verify', verifyMiddleWare)
  server.use('/api/verify-image', verifyImageMiddleWare)
  server.use('/api/order-bottle', orderBottleMiddleWare)
  server.use('/api/get-transactions', transactionsHistory)
  server.use('/api/create-checkout-session', createCheckoutSession)
  server.use('/api/casks', getNFTs)
  server.use('/api/webhook', webhook)
  server.use('/api/offer', offers)

  server.listen(4000, () => console.log('Running on http://localhost:4000'))
})()
