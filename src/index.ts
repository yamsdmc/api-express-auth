import express from 'express';
import {AuthController} from "@infrastructure/http/controllers/auth-controller";
import {authRouter} from "@infrastructure/http/routes/auth-routes";
import {errorHandler} from "@infrastructure/http/middleware/error-handler";
import {JwtTokenService} from "@infrastructure/services/jwt-token-service";
import {BcryptPasswordService} from "@infrastructure/services/bcrypt-password-service";
import {authMiddleware} from "@infrastructure/http/middleware/auth-middleware";
import {protectedRouter} from "@infrastructure/http/routes/protected-routes";
import {RefreshTokenUseCase} from "@application/use-cases/auth/refresh-token";
import {standardLimiter} from "@infrastructure/http/middleware/rate-limit";
import morgan from "morgan";
import cors from "cors";
import {corsOptions} from "@infrastructure/http/middleware/security";
import helmet from "helmet";
import {
    InMemoryRefreshTokenRepository
} from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import {InMemoryUserRepository} from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import {LogoutUseCase} from "@application/use-cases/auth/logout";
import {InMemoryTokenBlacklist} from "@infrastructure/services/token-blacklist";
import {RegisterUseCase} from "@application/use-cases/auth/register";
import {LoginUseCase} from "@application/use-cases/auth/login";

const app = express();

const userRepository = new InMemoryUserRepository();
const passwordService = new BcryptPasswordService();
const tokenService = new JwtTokenService();
const refreshTokenRepository = new InMemoryRefreshTokenRepository();
const blacklistService = new InMemoryTokenBlacklist();
const logoutUseCase = new LogoutUseCase(blacklistService, refreshTokenRepository);
const registerUseCase = new RegisterUseCase(userRepository, passwordService, tokenService, refreshTokenRepository);
const loginUseCase = new LoginUseCase(userRepository, passwordService, tokenService, refreshTokenRepository);
const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository, tokenService);
const authController = new AuthController(registerUseCase, loginUseCase, logoutUseCase, refreshTokenUseCase);


app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(standardLimiter);

app.use('/api/auth', authRouter(authController, tokenService, blacklistService));
app.use('/health', (_, res) => {
    res.send('OK');
})

app.use('/api/protected', authMiddleware(tokenService, blacklistService), protectedRouter(tokenService));

app.use(errorHandler);


const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
    console.log('Shutting down gracefully...');
    blacklistService.stop();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
}