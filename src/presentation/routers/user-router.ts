import express from 'express'
import { Request, Response } from 'express'

import { GetUserUseCase } from '../../domain/interfaces/use-cases/get-user'
import { SaveUserUseCase } from '../../domain/interfaces/use-cases/save-user'
import { generateNonce } from '../utils/generateNonce'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { ethers } from 'ethers'
import { GetRefreshTokensUseCase } from '../../domain/interfaces/use-cases/get-refresh-tokens'
import { CreateRefreshTokensUseCase } from '../../domain/interfaces/use-cases/create-refresh-token'
import { authenticateToken } from '../middlewares/authenticateToken'
import { DeleteTokensUseCase } from '../../domain/interfaces/use-cases/delete-tokens'

export default function UserRouter(
  getUser: GetUserUseCase,
  saveUser: SaveUserUseCase,
  getRefreshTokens: GetRefreshTokensUseCase,
  createRefreshToken: CreateRefreshTokensUseCase,
  removeTokens: DeleteTokensUseCase
) {
  const router = express.Router()

  router.get(
    '/verify',
    authenticateToken,
    async (req: Request, res: Response) => {
      res.status(200).send({ message: 'Allowed access' })
    }
  )

  router.get(
    '/:userAddress/cleanTokens',
    async (req: Request, res: Response) => {
      const address = req.params.userAddress
      await removeTokens.execute(address)
      res.status(200).send({ message: 'Logout correctly' })
    }
  )

  router.post('/refresh', async (req: Request, res: Response) => {
    const refreshToken = req.body.token

    if (refreshToken == null) return res.sendStatus(401)

    const refreshTokenDB = await getRefreshTokens.execute(refreshToken)

    console.log('REFRESH TOKEN', refreshTokenDB)

    if (!refreshTokenDB) return res.sendStatus(403)

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
      (err: any, user: any) => {
        if (err) return res.sendStatus(403)
        const accessToken = jwt.sign(
          {
            _id: user._id,
            address: user.address,
          },
          process.env.TOKEN_SECRET as string,
          { expiresIn: '15m' }
        )
        res.json({ token: accessToken })
      }
    )
  })

  router.get('/:userAddress', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params?.userAddress as string
      let user
      if (userAddress) {
        user = await getUser.execute(userAddress.toLowerCase())
        if (!user) {
          await saveUser.execute(uuidv4(), {
            email: undefined,
            nickname: undefined,
            address: userAddress.toLowerCase(),
            nonce: JSON.stringify(generateNonce()),
            //   contractAddress: userAddress,
            //   id: uuidv4(),
          })
          user = await getUser.execute(userAddress.toLowerCase())
        }

        return res.json({ ...user })
      } else {
        throw 'Token id is necessary'
      }
    } catch {
      return res.status(422).send({ message: 'Cannot get the user' })
    }
  })

  router.get('/:userAddress/nonce', async (req: Request, res: Response) => {
    try {
      const userAddress = req.params?.userAddress as string
      const user = await getUser.execute(userAddress.toLowerCase())
      return res.json(user!.nonce)
    } catch {
      return res.status(422).send({ message: 'Cannot get nonce' })
    }
  })

  router.post(
    '/:userAddress/signature',
    async (req: Request, res: Response) => {
      try {
        const userAddress = req.params?.userAddress as string
        const { message, signature, address } = req.body
        const user = await getUser.execute(userAddress.toLowerCase())
        if (user) {
          // SIGNER
          const signerAddr = await ethers.utils.verifyMessage(
            JSON.parse(message),
            signature
          )

          // Check if address matches
          if (address.toLowerCase() === signerAddr.toLowerCase()) {
            // Change user nonce
            await saveUser.execute(req.body.id, {
              nonce: JSON.stringify(generateNonce()),
            })
            // Set jwt token
            const token = jwt.sign(
              {
                _id: user._id,
                address: user.address,
              },
              process.env.TOKEN_SECRET as string,
              { expiresIn: '15m' }
            )

            const refreshToken = jwt.sign(
              {
                _id: user._id,
                address: user.address,
              },
              process.env.REFRESH_TOKEN_SECRET as string
            )

            const refresh = {
              refreshToken,
              address: user.address,
            }

            await createRefreshToken.execute(uuidv4(), refresh)

            res.status(200).json({
              success: true,
              token: `${token}`,
              refreshToken,
              user: user,
              msg: 'You are now logged in.',
            })
          } else {
            // User is not authenticated
            res.status(401).send('Invalid credentials')
          }
        }
      } catch (err) {
        console.log(err)
        return res.status(422).send({ message: 'Cannot sign the user' })
      }

      //   const { address } = req.body
      //   const token = jwt.sign(
      //     { address: address },
      //     process.env.TOKEN_SECRET as string,
      //     {
      //       expiresIn: '2 days',
      //     }
      //   )
      //   console.log(token)
      //   return res.json(token)
    }
  )

  router.post('/', async (req: Request, res: Response) => {
    const { id, email, nickname } = req.body
    try {
      await saveUser.execute(id, { email, nickname })
      res.status(201).send({ message: 'User updated' })
    } catch (err) {
      return res.status(422).send({ message: 'Cannot save the user' })
    }
  })

  return router
}
