import { Sort } from "mongodb"

export interface NoSQLDatabaseWrapper {
    find(query: object, sort?: Sort): Promise<any[]>
    insertOne(doc: any): void
    deleteOne(id: String): void
    updateOne(id: String, data: object): void

}