import axios from "axios";
import { CreateNFTUseCase } from "../../domain/interfaces/use-cases/create-nft-use-case";

export default function OnMint(
    createNFTUseCase: CreateNFTUseCase
) {

    const handleOnTransfer = async (nft: any) => {

        const metaResponse = await axios.get(nft.tokenURI);
        const meta: any = await metaResponse.data;

        await createNFTUseCase.execute(nft.tokenId, {
            name: meta.name,
            value: nft.value,
            pinata: nft.tokenURI,
            description: meta.description,
            image: meta.image,
            owner: {
                address: nft.owner
            },
            attributes: meta.attributes

        })
    }

    return handleOnTransfer

}