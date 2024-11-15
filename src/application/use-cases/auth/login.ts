import {UserRepository} from "@domain/repositories/user-repository";
import {PasswordService} from "../../services/password-service.js";
import {AuthPayload} from "@domain/auth";
import {InvalidCredentialsError} from "@domain/errors";
import {TokenService} from "../../services/token-service";
import {RefreshTokenRepository} from "@domain/repositories/refresh-token-repository";
import {JWT_CONFIG} from "../../../config";

export class LoginUseCase {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly passwordService: PasswordService,
        private readonly tokenService: TokenService,
        private readonly refreshTokenRepository: RefreshTokenRepository
    ) {}

    async execute(email: string, password: string): Promise<AuthPayload> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new InvalidCredentialsError();
        }

        const isPasswordValid = await this.passwordService.compare(
            password,
            user.password
        );
        if (!isPasswordValid) {
            throw new InvalidCredentialsError();
        }

        const accessToken = this.tokenService.generateToken(user.id!);
        const refreshToken = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + JWT_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        await this.refreshTokenRepository.save(user.id!, refreshToken, expiresAt);

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id!,
                email: user.email,
                createdAt: user.createdAt
            }
        };
    }
}