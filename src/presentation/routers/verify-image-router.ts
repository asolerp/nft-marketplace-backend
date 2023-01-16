

import { v4 as uuidv4 } from "uuid";
import express from 'express'
import { Request, Response } from 'express'
import { pinataApiKey, pinataSecretApiKey } from "../../data/data-sources/blockchain/utils";
import { FileReq, NftMeta } from "../../types/nft";
import FormData from "form-data";

import { addressCheckMiddleware } from "../middlewares/addressCheckMiddleware";
import axios from "axios";

export default function VerifyImageRouter() {

    const router = express.Router();

    router.post('/', addressCheckMiddleware,  async (req: Request, res: Response) => {
        try {
            const {
                bytes,
                fileName,
                contentType
            } = req.body as FileReq;
        
            if (!bytes || !fileName || !contentType) {
                return res.status(422).send({message: "Image data are missing"});
            }
        
            const buffer = Buffer.from(Object.values(bytes));
            const formData = new FormData();
        
            formData.append(
                "file",
                buffer, {
                contentType,
                filename: fileName + "-" + uuidv4()
                }
            );
        
            const fileRes = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                maxBodyLength: Infinity,
                headers: {
                "Content-Type": `multipart/form-data; boundary=${formData.getBoundary()}`,
                pinata_api_key: pinataApiKey,
                pinata_secret_api_key: pinataSecretApiKey
                }
            });
        
            return res.status(200).send(fileRes.data);
        } catch (e: any) {
            console.error(e.message)
        }
        })
    return router
}