export interface TransactionHistoryRequestModel {
    from: string;
    to: string;
    date: Date;
    tokenId: string,
    value: string,
}

export interface TransactionHistoryResponseModel {
    id: string;
    from: string;
    to: string;
    date: Date;
    tokenId: string,
    value: string,
}

export interface TransactionHistory {
    id: string;
    from: string;
    to: string;
    date: Date;
    tokenId: string,
    value: string
}