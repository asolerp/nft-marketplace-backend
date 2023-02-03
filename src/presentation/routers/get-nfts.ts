import express from 'express'
import { Request, Response } from 'express'
import { FractionalizeNftUseCase } from '../../domain/interfaces/use-cases/fractionalize-nft'
import { GetCaskInfoUseCase } from '../../domain/interfaces/use-cases/casks/get-cask-info'

import { GetNFTsUseCase } from '../../domain/interfaces/use-cases/casks/get-nfts'
import { authenticateToken } from '../middlewares/authenticateToken'

import jwt_decode from 'jwt-decode'
import { GetOwnedNftsUseCase } from '../../domain/interfaces/use-cases/casks/get-owned-nfts'

export default function GetNftsRouter(
  getNfts: GetNFTsUseCase,
  getCaskInfo: GetCaskInfoUseCase,
  getOwnedNfts: GetOwnedNftsUseCase,
  fracionalizeNft: FractionalizeNftUseCase
) {
  const router = express.Router()

  router.get('/', async (req: Request, res: Response) => {
    const nfts = await getNfts.execute()
    return res.json(nfts)
  })

  router.get('/me', authenticateToken, async (req: Request, res: Response) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    const { address } = jwt_decode(token as string) as any
    const nfts = await getOwnedNfts.execute(address)
    return res.json(nfts)
  })

  router.get('/:caskId', async (req: Request, res: Response) => {
    const { caskId } = req.params
    const nfts = await getCaskInfo.execute(caskId)
    return res.json(nfts)
  })

  router.post('/fractionalizeToken', async (req: Request, res: Response) => {
    const { name, symbol, collection, tokenId, supply, listPrice } = req.body
    await fracionalizeNft.execute({
      name,
      symbol,
      collection,
      tokenId,
      supply,
      listPrice,
    })
    res.sendStatus(200)
  })

  return router
}
