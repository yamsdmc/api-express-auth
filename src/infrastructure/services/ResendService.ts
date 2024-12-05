import { UserVerificationDto } from "@domain/DTO/user-email-verification.dto";
import { EmailService } from "@application/services/email-service";
import { generateVerificationEmailTemplate } from "@infrastructure/services/templates/verify-email-templates";
import { Resend } from "resend";

export class ResendService implements EmailService {
  private readonly resend;

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY environment variable");
    }
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendVerificationEmail(
    userVerification: UserVerificationDto,
    token: string
  ): Promise<void> {
    try {
      const result = await this.resend.emails.send({
        from: "XpatMart <no-reply@xpatmart.com>",
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
