import { beforeEach, describe, expect, it } from "vitest";
import { VerifyEmailUseCase } from "@application/use-cases/auth/verify-email";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { InvalidTokenError } from "@domain/errors";
import { VerificationCodeService } from "@application/services/verification-code-service";
import { VerificationCodeRepository } from "@domain/repositories/verification-code-repository";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";
import { VerificationCodeType } from "@domain/enums/verification-code-type";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let userRepository: InMemoryUserRepository;
  let verificationCodeRepository: VerificationCodeRepository;
  let verificationCodeService: VerificationCodeService;

  const verificationCode = "123456";
  const userId = "1";

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    verificationCodeRepository = new InMemoryVerificationCodeRepository();
    verificationCodeService = new VerificationCodeService(
      verificationCodeRepository
    );
    useCase = new VerifyEmailUseCase(userRepository, verificationCodeService);

    await userRepository.create({
      id: userId,
      email: "test@example.com",
      password: "hashed_password",
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstname: "Test",
      lastname: "User",
    });

    await verificationCodeRepository.save({
      id: "code-1",
      code: verificationCode,
      userId: userId,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 15 * 60000),
      createdAt: new Date(),
    });
  });

  it("should verify user email with valid code", async () => {
    await useCase.execute(verificationCode, userId);

    const user = await userRepository.findById(userId);
    expect(user?.isVerified).toBe(true);

    const usedCode =
      await verificationCodeRepository.findByCode(verificationCode);
    expect(usedCode?.usedAt).toBeTruthy();
  });

  it("should throw error with invalid code", async () => {
    await expect(useCase.execute("invalid-code", userId)).rejects.toThrow(
      InvalidTokenError
    );
  });

  it("should throw error with expired code", async () => {
    await verificationCodeRepository.save({
      id: "expired-code",
      code: "expired",
      userId: userId,
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() - 1000), // Dans le passé
      createdAt: new Date(Date.now() - 60000),
    });

    await expect(useCase.execute("expired", userId)).rejects.toThrow(
      InvalidTokenError
    );
  });

  it("should throw error with already used code", async () => {
    await verificationCodeRepository.markAsUsed("code-1");

    await expect(useCase.execute(verificationCode, userId)).rejects.toThrow(
      InvalidTokenError
    );
  });

  it("should throw error with mismatched userId", async () => {
    const wrongUserId = "wrong-user";
    await expect(
      useCase.execute(verificationCode, wrongUserId)
    ).rejects.toThrow(InvalidTokenError);
  });
});
