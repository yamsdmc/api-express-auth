import {EmailService} from "@application/services/email-service";
import {CONFIG} from "../../config";

export class ConsoleEmailService implements EmailService {
    async sendVerificationEmail(email: string, token: string): Promise<void> {
        console.log('==========================================');
        console.log('Email de vérification');
        console.log('------------------------------------------');
        console.log(`To: ${email}`);
        console.log(`Verification URL: ${CONFIG.APP.URL}/verify-email?token=${token}`);
        console.log('==========================================');
    }
}