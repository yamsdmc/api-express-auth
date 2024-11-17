import { describe, it, expect, beforeEach } from "vitest";
import { RegisterUseCase } from "./register";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { BcryptPasswordService } from "@infrastructure/services/bcrypt-password-service";
import { JwtTokenService } from "@infrastructure/services/jwt-token-service";
import { InMemoryRefreshTokenRepository } from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import { ConsoleEmailService } from "@infrastructure/services/console-email-service";

describe("RegisterUseCase", () => {
  let useCase: RegisterUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordService: BcryptPasswordService;
  let tokenService: JwtTokenService;
  let refreshTokenRepository: InMemoryRefreshTokenRepository;

  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    passwordService = new BcryptPasswordService();
    tokenService = new JwtTokenService();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const emailService = new ConsoleEmailService();
    useCase = new RegisterUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository,
      emailService
    );
  });

  it("should register a new user successfully", async () => {
    const result = await useCase.execute("test@example.com", "password123");

    expect(result.user.email).toBe("test@example.com");
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.user.id).toBeDefined();
    expect(result.user.password).toBeUndefined();
  });

  it("should throw error if email already exists", async () => {
    await useCase.execute("test@example.com", "password123");

    await expect(
      useCase.execute("test@example.com", "newpassword")
    ).rejects.toThrow("Email already exists");
  });
});
