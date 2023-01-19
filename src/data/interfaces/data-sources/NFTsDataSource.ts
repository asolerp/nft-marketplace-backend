// data/data-sources/contact-data-source.ts

import { NFTRequestModel, NFTResponseModel } from "../../../domain/model/NFT";

export interface NFTsDataSource {
    save(id: string, nft: NFTRequestModel): Promise<void>;
    search(tokenId: string): Promise<NFTResponseModel[] | null>;
}