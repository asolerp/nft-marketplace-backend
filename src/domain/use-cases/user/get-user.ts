import { TransactionRepository } from "../../interfaces/repository/transaction-repository";
import { UserRepository } from "../../interfaces/repository/user-repository";
import { GetTransactionsByTokenIdUseCase } from "../../interfaces/use-cases/get-transaction-by-token-id-use-case";
import { GetUserUseCase } from "../../interfaces/use-cases/get-user";


export class GetUser implements GetUserUseCase {
    userRepository: UserRepository
    constructor(userRepository: UserRepository) {
        this.userRepository = userRepository
    }

    async execute(address: string) {
        const result = await this.userRepository.getUser(address)
        return result;
    }
}