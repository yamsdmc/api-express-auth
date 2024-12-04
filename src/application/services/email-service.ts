import { UserVerificationDto } from "@domain/DTO/user-email-verification.dto";

export interface EmailService {
  sendVerificationEmail(
    userVerification: UserVerificationDto,
    token: string
  ): Promise<void>;
}
