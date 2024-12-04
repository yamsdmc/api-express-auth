import { EmailService } from "@application/services/email-service";
import { generateVerificationEmailTemplate } from "@infrastructure/services/templates/verify-email-templates";
import { UserVerificationDto } from "@domain/DTO/user-email-verification.dto";

const formData = require("form-data");
const Mailgun = require("mailgun.js");

export class MailgunService implements EmailService {
  private mg;
  private readonly domain: string;

  constructor() {
    const mailgun = new Mailgun(formData);
    this.domain = "sandbox541d88fbb2bd406e9696fcedf755c08c.mailgun.org";
    this.mg = mailgun.client({
      username: "api",
      key: "a8789cb864304517207a0a88358a0adf-f55d7446-9b348e9b",
      // url: "https://api.mailgun.net/v3",
    });
  }

  async sendVerificationEmail(
    userVerification: UserVerificationDto,
    token: string
  ): Promise<void> {
    const verificationUrl = `http://localhost:3000/verify-email?token=${token}`;

    try {
      const result = await this.mg.messages.create(this.domain, {
        from: `XpatMart <mailgun@${this.domain}>`,
        to: [userVerification.email],
        subject: "Verify your email for XpatMart",
        text: `Verify your XpatMart account`,
        html: generateVerificationEmailTemplate(
          token,
          userVerification.firstname
        ),
      });
      console.log("Email sent successfully:", result);
    } catch (error) {
      console.error("Mailgun error:", error);
      throw new Error("Failed to send verification email");
    }
  }
}
