import { describe, beforeEach, it, expect } from "vitest";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";
import { EmailService } from "@application/services/email-service";
import { VerificationCodeService } from "@application/services/verification-code-service";
import {
  EmailAlreadyVerifiedError,
  InvalidCredentialsError,
} from "@domain/errors";
import { vi } from "vitest";
import { VerificationCodeType } from "@domain/enums/verification-code-type";
import { ResendVerificationEmailUseCase } from "@application/use-cases/auth/resend-verification";

describe("ResendVerificationEmailUseCase", () => {
  let useCase: ResendVerificationEmailUseCase;
  let userRepository: InMemoryUserRepository;
  let verificationCodeRepository: InMemoryVerificationCodeRepository;
  let verificationCodeService: VerificationCodeService;
  let emailService: EmailService;

  const testUser = {
    id: "1",
    email: "test@example.com",
    password: "hashed_password",
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    firstname: "Test",
    lastname: "User",
  };

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    verificationCodeRepository = new InMemoryVerificationCodeRepository();
    verificationCodeService = new VerificationCodeService(
      verificationCodeRepository
    );
    emailService = {
      sendVerificationEmail: vi.fn(),
    } as unknown as EmailService;

    useCase = new ResendVerificationEmailUseCase(
      userRepository,
      emailService,
      verificationCodeService
    );

    await userRepository.create(testUser);
  });

  it("should generate new code and send email for unverified user", async () => {
    await useCase.execute(testUser.email);

    const codes = await verificationCodeRepository.findLatestByUserId(
      testUser.id,
      VerificationCodeType.EMAIL_VERIFICATION
    );
    expect(codes).not.toBeNull();

    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(emailService.sendVerificationEmail).toHaveBeenCalledWith(
      { email: testUser.email, firstname: testUser.firstname },
      expect.any(String)
    );
  });

  it("should throw error for non-existent email", async () => {
    await expect(useCase.execute("nonexistent@example.com")).rejects.toThrow(
      InvalidCredentialsError
    );
  });

  it("should throw error for already verified email", async () => {
    await userRepository.update(testUser.id, { isVerified: true });

    await expect(useCase.execute(testUser.email)).rejects.toThrow(
      EmailAlreadyVerifiedError
    );
  });

  it("should reuse existing valid code if present", async () => {
    await useCase.execute(testUser.email);
    const firstCode = await verificationCodeRepository.findLatestByUserId(
      testUser.id,
      VerificationCodeType.EMAIL_VERIFICATION
    );

    await useCase.execute(testUser.email);
    const secondCode = await verificationCodeRepository.findLatestByUserId(
      testUser.id,
      VerificationCodeType.EMAIL_VERIFICATION
    );

    expect(firstCode?.code).toBe(secondCode?.code);
  });
});
