import { UserRepository } from "@domain/repositories/user-repository";
import { InvalidCredentialsError } from "@domain/errors";
import { UserDTO } from "@domain/DTO/UserDTO";
import { UserVO } from "@domain/entities/User";

export class GetMeUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<Omit<UserDTO, "password"> & { fullname: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const userValueObject = new UserVO(user)
    const {password, ...userWithoutPassword} = userValueObject.toDTO();

    return {
      ...userWithoutPassword,
      fullname: userValueObject.fullName,
    };
  }
}
