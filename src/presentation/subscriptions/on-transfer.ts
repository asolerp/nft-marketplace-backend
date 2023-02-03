import { v4 as uuidv4 } from 'uuid'

import { CreateTransactionUseCase } from '../../domain/interfaces/use-cases/create-transaction-use-case'

export default function OnTransfer(
  createTransactionUseCase: CreateTransactionUseCase
) {
  const handleOnTransfer = async (transaction: any) => {
    await createTransactionUseCase.execute(uuidv4(), {
      from: transaction.nftAddress,
      to: transaction.buyer,
      date: new Date(),
      tokenId: transaction.tokenId,
      value: transaction?.price || 0,
    })
  }

  return handleOnTransfer
}
