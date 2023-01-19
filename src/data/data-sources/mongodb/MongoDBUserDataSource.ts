import { UserRequestModel } from '../../../domain/model/User'

import { UsersDataSource } from '../../interfaces/data-sources/UsersDataSource'

import { MongoRepository } from './MongoRepository'

export class MongoDBUserDataSource
  extends MongoRepository
  implements UsersDataSource
{
  protected collectionName(): string {
    return 'users'
  }

  public async save(id: string, user: UserRequestModel) {
    await this.persist(id, user)
  }

  public async search(address: string): Promise<any | null> {
    const collection = await this.collection()
    const document = await collection.findOne<any>({ address: address })

    return document || null
  }
}
