import {EmailAlreadyVerifiedError, InvalidCredentialsError} from "@domain/errors";
import {EmailService} from "@application/services/email-service";
import {UserRepository} from "@domain/repositories/user-repository";

export class ResendVerificationEmailUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly emailService: EmailService
    ) {}

    async execute(email: string): Promise<void> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        if (user.isVerified) {
            throw new EmailAlreadyVerifiedError();
        }

        const newVerificationToken = crypto.randomUUID();
        await this.userRepository.update(user.id!, {
            verificationToken: newVerificationToken
        });

        await this.emailService.sendVerificationEmail(email, newVerificationToken);
    }
}