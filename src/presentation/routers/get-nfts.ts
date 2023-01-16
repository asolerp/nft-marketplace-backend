import express from 'express'
import { Request, Response } from 'express'
import { addressCheckMiddleware } from "../middlewares/addressCheckMiddleware";
import { GetNFTsUseCase } from "../../domain/interfaces/use-cases/get-nfts";

export default function GetNftsRouter(
    getNfts: GetNFTsUseCase,
) {

    const router = express.Router();

    router.get('/', async (req: Request, res: Response) => {
      await getNfts.execute()
      return res.json(true)
    })

    return router
}