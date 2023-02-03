export interface OfferRepository {
  getOffers(caskId: string): Promise<any>
}
