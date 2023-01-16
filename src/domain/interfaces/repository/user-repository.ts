import { UserRequestModel, UserResponseModel } from '../../model/User'

export interface UserRepository {
  getUser(address: string): Promise<UserResponseModel | null>
  createUser(id: string, user: UserRequestModel): Promise<UserResponseModel>
}
