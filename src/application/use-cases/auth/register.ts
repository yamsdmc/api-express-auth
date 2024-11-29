import { UserRepository } from "@domain/repositories/user-repository";
import { PasswordService } from "../../services/password-service.js";
import { TokenService } from "../../services/token-service.js";
import { AuthPayload } from "@domain/auth";
import { UserAlreadyExistsError } from "@domain/errors";
import { RefreshTokenRepository } from "@domain/repositories/refresh-token-repository";
import { CONFIG } from "../../../config";
import { EmailService } from "@application/services/email-service";

export class RegisterUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private tokenService: TokenService,
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(
    email: string,
    password: string,
    firstname: string,
    lastname: string
  ): Promise<AuthPayload> {
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const hashedPassword = await this.passwordService.hash(password);
    const verificationToken = crypto.randomUUID();

    const user = await this.userRepository.create({
      id: crypto.randomUUID(),
      email,
      password: hashedPassword,
      isVerified: false,
      verificationToken,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstname,
      lastname,
    });

    await this.emailService.sendVerificationEmail(email, verificationToken);

    const accessToken = this.tokenService.generateToken(user.id!);
    const refreshToken = crypto.randomUUID();
    const expiresAt = new Date(
      Date.now() + CONFIG.JWT.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000
    );
    await this.refreshTokenRepository.save(user.id!, refreshToken, expiresAt);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id!,
        email: user.email,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        firstname: user.firstname,
        lastname: user.lastname,
      },
    };
  }
}
