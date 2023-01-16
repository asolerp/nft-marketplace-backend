export type Trait = "year" | "extraction" | "country" | "region"

export type NftAttribute = {
    trait_type: Trait;
    value: string;
}

export type NftMeta = {
    name: string;
    description: string;
    image: string;
    attributes: NftAttribute[]
}

export type FileReq = {
    bytes: Uint8Array;
    contentType: string;
    fileName: string;
}