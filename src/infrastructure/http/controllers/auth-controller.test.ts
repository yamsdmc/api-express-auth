import { describe, it, expect, vi, beforeEach } from "vitest";
import { Request, Response } from "express";
import { AuthController } from "./auth-controller";
import { RegisterUseCase } from "@application/use-cases/auth/register";
import { LoginUseCase } from "@application/use-cases/auth/login";
import { InMemoryRefreshTokenRepository } from "../../repositories/in-memory/in-memory-refresh-token-repository";
import { RefreshTokenUseCase } from "@application/use-cases/auth/refresh-token";
import { InMemoryUserRepository } from "../../repositories/in-memory/in-memory-user-repository";
import { BcryptPasswordService } from "../../services/bcrypt-password-service";
import { JwtTokenService } from "../../services/jwt-token-service";
import { ConsoleEmailService } from "@infrastructure/services/console-email-service";
import { VerifyEmailUseCase } from "@application/use-cases/auth/verify-email";
import { LogoutUseCase } from "@application/use-cases/auth/logout";
import { InMemoryTokenBlacklist } from "@infrastructure/services/token-blacklist";
import { ResendVerificationEmailUseCase } from "@application/use-cases/auth/resend-verification";
import { MailgunService } from "@infrastructure/services/mailgun-service";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";
import { VerificationCodeService } from "@application/services/verification-code-service";

describe("AuthController", () => {
  let controller: AuthController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let userRepository: InMemoryUserRepository;
  let registerUseCase: RegisterUseCase;
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    const passwordService = new BcryptPasswordService();
    const tokenService = new JwtTokenService();
    const refreshTokenRepository = new InMemoryRefreshTokenRepository();
    const refreshTokenUseCase = new RefreshTokenUseCase(
      refreshTokenRepository,
      tokenService
    );
    const emailService = new ConsoleEmailService();
    const blackListService = new InMemoryTokenBlacklist();
    const verificationCodeRepository = new InMemoryVerificationCodeRepository();
    const verificationCodeService = new VerificationCodeService(
      verificationCodeRepository
    );
    const verifyEmailUseCase = new VerifyEmailUseCase(
      userRepository,
      verificationCodeService
    );
    registerUseCase = new RegisterUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository,
      emailService,
      verificationCodeService
    );
    const loginUseCase = new LoginUseCase(
      userRepository,
      passwordService,
      tokenService,
      refreshTokenRepository
    );
    const logoutUseCase = new LogoutUseCase(
      blackListService,
      refreshTokenRepository
    );
    const mailerService =
      process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test"
        ? new ConsoleEmailService()
        : new MailgunService();
    const resendVerificationEmailUseCase = new ResendVerificationEmailUseCase(
      userRepository,
      mailerService,
      verificationCodeService
    );
    controller = new AuthController(
      registerUseCase,
      loginUseCase,
      logoutUseCase,
      refreshTokenUseCase,
      verifyEmailUseCase,
      resendVerificationEmailUseCase
    );
    mockResponse = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe("register", () => {
    beforeEach(() => {
      mockRequest = {
        body: { email: "test@example.com", password: "password123" },
      };
    });

    it("should return 201 on successful registration", async () => {
      await controller.register(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: expect.objectContaining({
            email: "test@example.com",
          }),
        })
      );
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      mockRequest = {
        body: { email: "test@example.com", password: "password123" },
      };
      await controller.register(
        mockRequest as Request,
        mockResponse as Response
      );
    });

    it("should return 200 on successful login", async () => {
      const user = await userRepository.findByEmail(mockRequest.body.email);
      await userRepository.update(user?.id!, { isVerified: true });
      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
          user: expect.objectContaining({
            email: "test@example.com",
          }),
        })
      );
    });

    it("should return 401 with invalid credentials", async () => {
      mockRequest.body.password = "wrongpassword";
      const user = await userRepository.findByEmail(mockRequest.body.email);
      await userRepository.update(user?.id!, { isVerified: true });
      await controller.login(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "Invalid credentials",
      });
    });
  });
});
