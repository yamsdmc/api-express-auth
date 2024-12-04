import { MailgunService } from "@infrastructure/services/mailgun-service";

async function testEmail() {
  try {
    const mailgunService = new MailgunService();
    await mailgunService.sendVerificationEmail(
      { email: "yamsdmc@gmail.com", firstname: "YamsDMC" },
      "test-token-123"
    );
    console.log("Email envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
  }
}

testEmail();
