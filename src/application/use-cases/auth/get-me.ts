import {UserRepository} from "@domain/repositories/user-repository";
import {User} from "@domain/user";
import {InvalidCredentialsError} from "@domain/errors";

export class GetMeUseCase {
    constructor(
        private readonly userRepository: UserRepository
    ) {}

    async execute(userId: string): Promise<Omit<User, 'password'>> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        return {
            id: user.id!,
            email: user.email,
            isVerified: user.isVerified,
            createdAt: user.createdAt
        };
    }
}