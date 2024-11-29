import { UserRepository } from "@domain/repositories/user-repository";
import { InvalidCredentialsError } from "@domain/errors";
import { UserDTO } from "@domain/DTO/UserDTO";

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<Omit<UserDTO, "password">> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    return {
      id: user.id!,
      email: user.email,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      firstname: user.firstname,
      lastname: user.lastname,
    };
  }
}
