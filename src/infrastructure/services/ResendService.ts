import { UserVerificationDto } from "@domain/DTO/user-email-verification.dto";
import { EmailService } from "@application/services/email-service";
import { generateVerificationEmailTemplate } from "@infrastructure/services/templates/verify-email-templates";
import { Resend } from "resend";
import { CONFIG } from "../../config";

export class ResendService implements EmailService {
  private readonly resend;

  constructor() {
    if (!CONFIG.EMAIL.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    this.resend = new Resend(CONFIG.EMAIL.RESEND_API_KEY);
  }

  async sendVerificationEmail(
    userVerification: UserVerificationDto,
    token: string
  ): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: "XpatMart <no-reply@xpatmart.shop>",
        to: userVerification.email,
        subject: "Verify your email for XpatMart",
        html: generateVerificationEmailTemplate(
          token,
          userVerification.firstname
        ),
      });
      console.log("Email sent successfully:", result);
    } catch (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send verification email");
    }
  }
}
