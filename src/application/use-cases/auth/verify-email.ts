import { UserRepository } from "@domain/repositories/user-repository";
import { InvalidTokenError } from "@domain/errors";

export class VerifyEmailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(token: string): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new InvalidTokenError();
    }

    await this.userRepository.update(user.id!, {
      isVerified: true,
      verificationToken: null,
    });
  }
}
