import express from 'express'
import { Request, Response } from 'express'

import { GetTransactionsByTokenIdUseCase } from '../../domain/interfaces/use-cases/get-transaction-by-token-id-use-case'
import { authenticateToken } from '../middlewares/authenticateToken'

export default function TransactionsHistoryRouter(
  getTransactionsByTokenId: GetTransactionsByTokenIdUseCase
) {
  const router = express.Router()

  router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
      const tokenId = req.query?.tokenId as string

      if (tokenId) {
        const transactions = await getTransactionsByTokenId.execute(tokenId)
        return res.json(transactions)
      } else {
        throw 'Token id is necessary'
      }
    } catch {
      return res.status(422).send({ message: 'Cannot get transaction history' })
    }
  })

  return router
}
