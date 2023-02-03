// data/data-sources/contact-data-source.ts

import { OfferRequestModel } from '../../../domain/model/Offer'

export interface OfferDataSource {
  save(id: string, offer: OfferRequestModel): Promise<void>
  search(caskId: string): Promise<any | null>
}
