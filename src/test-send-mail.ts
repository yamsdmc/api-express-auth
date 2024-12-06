import { ResendService } from "@infrastructure/services/ResendService";

async function testEmail() {
  try {
    const resendService = new ResendService();
    await resendService.sendVerificationEmail(
      { email: "yamsdmc@gmail.com", firstname: "YamsDMC" },
      "test-token-123"
    );
    console.log("Email envoyé avec succès !");
  } catch (error) {
    console.error("Erreur lors de l'envoi:", error);
  }
}

testEmail();
