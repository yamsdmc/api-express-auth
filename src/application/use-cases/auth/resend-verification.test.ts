import { describe, it, expect, beforeEach, vi } from "vitest";
import { ResendVerificationEmailUseCase } from "@application/use-cases/auth/resend-verification";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { ConsoleEmailService } from "@infrastructure/services/console-email-service";
import {
  EmailAlreadyVerifiedError,
  InvalidCredentialsError,
} from "@domain/errors";

describe("ResendVerificationEmailUseCase", () => {
  let useCase: ResendVerificationEmailUseCase;
  let userRepository: InMemoryUserRepository;
  let emailService: ConsoleEmailService;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    emailService = new ConsoleEmailService();
    useCase = new ResendVerificationEmailUseCase(userRepository, emailService);
  });

  it("should generate new verification token and send email", async () => {
    const user = await userRepository.create({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      isVerified: false,
      verificationToken: "old-token",
      createdAt: new Date(),
      updatedAt: new Date(),
      firstname: "Test",
      lastname: "User",
    });

    await useCase.execute(user.email);

    const updatedUser = await userRepository.findByEmail(user.email);
    expect(updatedUser?.verificationToken).not.toBe("old-token");
    expect(updatedUser?.verificationToken).toBeDefined();
  });

  it("should throw EmailAlreadyVerifiedError if user is verified", async () => {
    await userRepository.create({
      id: "1",
      email: "test@example.com",
      password: "hashedPassword",
      isVerified: true,
      updatedAt: new Date(),
      createdAt: new Date(),
      firstname: "Test",
      lastname: "User",
    });

    await expect(useCase.execute("test@example.com")).rejects.toThrow(
      EmailAlreadyVerifiedError
    );
  });

  it("should throw InvalidCredentialsError if user not found", async () => {
    await expect(useCase.execute("nonexistent@example.com")).rejects.toThrow(
      InvalidCredentialsError
    );
  });
});
