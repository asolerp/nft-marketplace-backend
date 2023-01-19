// data/data-sources/contact-data-source.ts

import { UserRequestModel, UserResponseModel } from '../../../domain/model/User'

export interface UsersDataSource {
  save(id: string, user: UserRequestModel): Promise<void>
  search(address: string): Promise<UserResponseModel | null>
}
