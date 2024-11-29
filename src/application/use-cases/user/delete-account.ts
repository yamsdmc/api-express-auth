import { UserRepository } from "@domain/repositories/user-repository";
import { PasswordService } from "@application/services/password-service";
import { InvalidCredentialsError } from "@domain/errors";

export class DeleteAccountUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService
  ) {}

  async execute(userId: string, password: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    const isValidPassword = await this.passwordService.compare(
      password,
      user.password
    );
    if (!isValidPassword) {
      throw new InvalidCredentialsError();
    }

    await this.userRepository.delete(userId);
  }
}
