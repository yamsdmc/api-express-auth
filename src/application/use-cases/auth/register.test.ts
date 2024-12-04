import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUseCase } from "./register";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { BcryptPasswordService } from "@infrastructure/services/bcrypt-password-service";
import { JwtTokenService } from "@infrastructure/services/jwt-token-service";
import { InMemoryRefreshTokenRepository } from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import { ConsoleEmailService } from "@infrastructure/services/console-email-service";
import { VerificationCodeService } from "@application/services/verification-code-service";
import { VerificationCodeRepository } from "@domain/repositories/verification-code-repository";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordService: BcryptPasswordService;
  let tokenService: JwtTokenService;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let verificationCodeRepository: VerificationCodeRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    passwordService = new BcryptPasswordService();
    tokenService = new JwtTokenService();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    verificationCodeRepository = new InMemoryVerificationCodeRepository();
    const emailService = new ConsoleEmailService();
    const verifyCodeService = new VerificationCodeService(
      verificationCodeRepository
    );
    useCase = new RegisterUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository,
      emailService,
      verifyCodeService
    );
  });

  it("should register a new user successfully", async () => {
    const result = await useCase.execute(
      "test@example.com",
      "password123",
      "yamin",
      "Gherbi"
    );

    expect(result.user.email).toBe("test@example.com");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBeDefined();
    expect(result.user).not.toHaveProperty("password");
  });

  it("should throw error if email already exists", async () => {
    await useCase.execute("test@example.com", "password123", "yamin", "Gherbi");

    await expect(
      useCase.execute("test@example.com", "newpassword", "yamin", "Gherbi")
    ).rejects.toThrow("Email already exists");
  });
});
