import { EmailService } from "@application/services/email-service";
import { CONFIG } from "../../config";
import { MailgunService } from "@infrastructure/services/mailgun-service";
import { UserVerificationDto } from "@domain/DTO/user-email-verification.dto";

export class ConsoleEmailService implements EmailService {
  async sendVerificationEmail(
    userVerification: UserVerificationDto,
    token: string
  ): Promise<void> {
    console.log("Email de vérification");
    console.log("------------------------------------------");
    console.log(`To: ${userVerification.email}`);
    console.log(
      `Verification URL: ${CONFIG.APP.URL}/verify-email?token=${token}`
    );
    console.log("==========================================");
  }
}
