import {EmailService} from "@application/services/email-service";
import nodemailer from 'nodemailer';
import {CONFIG} from "../../config";

export class NodemailerService implements EmailService {
    private transporter;

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: CONFIG.EMAIL.HOST,
            port: CONFIG.EMAIL.PORT,
            secure: CONFIG.EMAIL.PORT === 465,
            auth: {
                user: CONFIG.EMAIL.USER,
                pass: CONFIG.EMAIL.PASSWORD
            }
        });
    }

    async sendVerificationEmail(email: string, token: string): Promise<void> {
        const verificationUrl = `${CONFIG.APP.URL}/verify-email?token=${token}`;

        const html = `
            <h1>Welcome to ${CONFIG.APP.NAME}!</h1>
            <p>Please verify your email address by clicking the link below:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>If you did not create an account, please ignore this email.</p>
        `;

        await this.transporter.sendMail({
            from: CONFIG.EMAIL.FROM,
            to: email,
            subject: `Verify your email for ${CONFIG.APP.NAME}`,
            html
        });
    }
}