import express from "express";
import {InMemoryUserRepository} from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import {JwtTokenService} from "@infrastructure/services/jwt-token-service";
import {BcryptPasswordService} from "@infrastructure/services/bcrypt-password-service";
import {
    InMemoryRefreshTokenRepository
} from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import {InMemoryTokenBlacklist} from "@infrastructure/services/token-blacklist";
import helmet from "helmet";
import cors from "cors";
import {corsOptions} from "@infrastructure/http/middleware/security";
import morgan from "morgan";
import {standardLimiter} from "@infrastructure/http/middleware/rate-limit";
import {authRouter} from "@infrastructure/http/routes/auth-routes";
import {authMiddleware} from "@infrastructure/http/middleware/auth-middleware";
import {errorHandler} from "@infrastructure/http/middleware/error-handler";
import swaggerUi from "swagger-ui-express";
import {swaggerSpec} from "@infrastructure/http/swagger/swagger";
import {protectedRouter} from "@infrastructure/http/routes/protected-routes";
import {LogoutUseCase} from "@application/use-cases/auth/logout";
import {RegisterUseCase} from "@application/use-cases/auth/register";
import {LoginUseCase} from "@application/use-cases/auth/login";
import {RefreshTokenUseCase} from "@application/use-cases/auth/refresh-token";
import {AuthController} from "@infrastructure/http/controllers/auth-controller";
import {VerifyEmailUseCase} from "@application/use-cases/auth/verify-email";
import {NodemailerService} from "@infrastructure/services/nodemailer-service";
import {ConsoleEmailService} from "@infrastructure/services/console-email-service";
import {ResendVerificationEmailUseCase} from "@application/use-cases/auth/resend-verification";

export const createApp = () => {
    const app = express();

    const userRepository = new InMemoryUserRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JwtTokenService();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const blacklistService = new InMemoryTokenBlacklist();
    const logoutUseCase = new LogoutUseCase(blacklistService, refreshTokenRepository);
    const verifyEmailUseCase = new VerifyEmailUseCase(userRepository);
    const mailerService = process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
        ? new ConsoleEmailService()
        : new NodemailerService();
    const registerUseCase = new RegisterUseCase(userRepository, passwordService, tokenService, refreshTokenRepository, mailerService);
    const loginUseCase = new LoginUseCase(userRepository, passwordService, tokenService, refreshTokenRepository);
    const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository, tokenService);
    const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(userRepository, mailerService);
    const authController = new AuthController(registerUseCase, loginUseCase, logoutUseCase, refreshTokenUseCase, verifyEmailUseCase, resendVerificationEmailUseCase);


    app.use(helmet());
    app.use(cors(corsOptions));
    app.use(morgan('dev'));
    app.use(express.json());
    app.use(standardLimiter);

    app.use('/api/auth', authRouter(authController, tokenService, blacklistService));
    app.use('/health', (_, res) => {
        res.send('OK');
    });
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.use('/api/protected', authMiddleware(tokenService, blacklistService), protectedRouter(tokenService));

    app.use(errorHandler);

    return {
        app,
        blacklistService,
        userRepository
    };
};
