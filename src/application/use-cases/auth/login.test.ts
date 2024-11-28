import { describe, it, expect, beforeEach } from "vitest";
import { LoginUseCase } from "./login";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { RegisterUseCase } from "./register";
import { BcryptPasswordService } from "@infrastructure/services/bcrypt-password-service";
import { TokenService } from "../../services/token-service";
import { JwtTokenService } from "@infrastructure/services/jwt-token-service";
import { InMemoryRefreshTokenRepository } from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import { EmailNotVerifiedError } from "@domain/errors";
import { EmailService } from "@application/services/email-service";
import { ConsoleEmailService } from "@infrastructure/services/console-email-service";

describe("LoginUseCase", () => {
  let loginUseCase: LoginUseCase;
  let registerUseCase: RegisterUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordService: BcryptPasswordService;
  let tokenService: TokenService;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;
  let emailService: EmailService;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    passwordService = new BcryptPasswordService();
    tokenService = new JwtTokenService();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();

    loginUseCase = new LoginUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository
    );
    emailService = new ConsoleEmailService();
    registerUseCase = new RegisterUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository,
      emailService
    );

    await registerUseCase.execute("test@example.com", "password123");
    const user = await userRepository.findByEmail("test@example.com");
    if (user) {
      await userRepository.update(user.id!, { isVerified: true });
    }
  });

  it("should login successfully with correct credentials", async () => {
    const result = await loginUseCase.execute(
      "test@example.com",
      "password123"
    );

    expect(result.user.email).toBe("test@example.com");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user).not.toHaveProperty("password");
  });
  it("should throw error when email is not verified", async () => {
    await userRepository.create({
      id: "1",
      email: "unverified@example.com",
      password: await passwordService.hash("password123"),
      isVerified: false,
      createdAt: new Date(),
        firstname: "Test",
        lastname: "User",
    });

    await expect(
      loginUseCase.execute("unverified@example.com", "password123")
    ).rejects.toThrow(EmailNotVerifiedError);
  });

  it("should throw error with incorrect password", async () => {
    await expect(
      loginUseCase.execute("test@example.com", "wrongpassword")
    ).rejects.toThrow("Invalid credentials");
  });

  it("should throw error with non-existent email", async () => {
    await expect(
      loginUseCase.execute("nonexistent@example.com", "password123")
    ).rejects.toThrow("Invalid credentials");
  });
});
