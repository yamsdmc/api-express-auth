import {
  EmailAlreadyVerifiedError,
  InvalidCredentialsError,
} from "@domain/errors";
import { EmailService } from "@application/services/email-service";
import { UserRepository } from "@domain/repositories/user-repository";
import { VerificationCodeService } from "@application/services/verification-code-service";
import { VerificationCodeType } from "@domain/enums/verification-code-type";

export class ResendVerificationEmailUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
    private readonly verificationCodeService: VerificationCodeService
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.isVerified) {
      throw new EmailAlreadyVerifiedError();
    }

    const verificationCode = await this.verificationCodeService.generateCode(
      user.id,
      VerificationCodeType.EMAIL_VERIFICATION
    );

    await this.emailService.sendVerificationEmail(
      { email, firstname: user.firstname },
      verificationCode
    );
  }
}
