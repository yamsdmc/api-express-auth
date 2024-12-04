import { UserRepository } from "@domain/repositories/user-repository";
import { InvalidTokenError } from "@domain/errors";
import { VerificationCodeService } from "@application/services/verification-code-service";
import { VerificationCodeType } from "@domain/enums/verification-code-type";

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly verificationCodeService: VerificationCodeService
  ) {}

  async execute(code: string, userId: string): Promise<void> {
    const isValid = await this.verificationCodeService.verifyCode(
      code,
      userId,
      VerificationCodeType.EMAIL_VERIFICATION
    );
    console.log({ isValid });
    if (!isValid) {
      throw new InvalidTokenError();
    }

    await this.userRepository.update(userId, {
      isVerified: true,
    });
  }
}
