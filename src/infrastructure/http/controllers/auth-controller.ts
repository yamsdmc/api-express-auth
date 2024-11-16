import {Request, Response} from 'express';
import {RegisterUseCase} from "@application/use-cases/auth/register";
import {LoginUseCase} from "@application/use-cases/auth/login";
import {RefreshTokenUseCase} from "@application/use-cases/auth/refresh-token";
import {LogoutUseCase} from "@application/use-cases/auth/logout";
import {VerifyEmailUseCase} from "@application/use-cases/auth/verify-email";
import {EmailAlreadyVerifiedError, InvalidCredentialsError, InvalidTokenError} from "@domain/errors";
import * as console from "node:console";
import {ResendVerificationEmailUseCase} from "@application/use-cases/auth/resend-verification";

export class AuthController {
    constructor(
        private readonly registerUseCase: RegisterUseCase,
        private readonly loginUseCase: LoginUseCase,
        private readonly logoutUseCase: LogoutUseCase,
        private readonly refreshTokenUseCase: RefreshTokenUseCase,
        private readonly verifyEmailUseCase: VerifyEmailUseCase,
        private readonly resendVerificationEmailUseCase: ResendVerificationEmailUseCase
    ) {
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body;
            const result = await this.registerUseCase.execute(email, password);
            res.status(201).json(result);
        } catch (error: any) {
            res.status(error.status || 400).json({message: error.message});
        }
    }

    async login(req: Request, res: Response): Promise<void> {
        try {
            const {email, password} = req.body;
            const result = await this.loginUseCase.execute(email, password);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 401).json({message: error.message});
        }
    }

    async refresh(req: Request, res: Response): Promise<void> {
        try {
            const {refreshToken} = req.body;
            const result = await this.refreshTokenUseCase.execute(refreshToken);
            res.status(200).json(result);
        } catch (error: any) {
            res.status(error.status || 401).json({message: error.message});
        }
    }

    async logout(req: Request, res: Response): Promise<void> {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            const {refreshToken} = req.body;

            await this.logoutUseCase.execute(token!, refreshToken);
            res.status(200).json({message: 'Logged out successfully'});
        } catch (error: any) {
            res.status(error.status || 400).json({message: error.message});
        }
    }
    async verifyEmail(req: Request, res: Response): Promise<void> {
        try {
            await this.verifyEmailUseCase.execute(req.body.token);
            res.status(200).json({ message: 'Email verified successfully' });
        } catch (error) {
            if (error instanceof InvalidTokenError) {
                res.status(error.status || 400).json({ message: error.message });
                return;
            }
            throw error;
        }
    }
    async resendVerification(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.resendVerificationEmailUseCase.execute(email);
            res.status(200).json({ message: 'Verification email sent' });
        } catch (error) {
            if (error instanceof EmailAlreadyVerifiedError) {
                res.status(error.status).json({
                    code: error.code,
                    message: error.message
                });
                return;
            }
            if (error instanceof InvalidCredentialsError) {
                res.status(404).json({ message: 'User not found' });
                return;
            }
            throw error;
        }
    }
}