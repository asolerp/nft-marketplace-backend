import express from 'express'
import { Request, Response } from 'express'
import { GetOffersUseCase } from '../../domain/interfaces/use-cases/offers/get-offers'

import { authenticateToken } from '../middlewares/authenticateToken'

export default function OffersRouter(getOffers: GetOffersUseCase) {
  const router = express.Router()

  router.get(
    '/:caskId',
    authenticateToken,
    async (req: Request, res: Response) => {
      const caskId = req.params.caskId
      console.log('CaskId: ', caskId)
      const offers = await getOffers.execute(caskId)
      res.json(offers)
    }
  )

  return router
}
