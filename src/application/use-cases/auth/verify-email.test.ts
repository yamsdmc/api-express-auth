import { describe, it, expect, beforeEach } from "vitest";
import { VerifyEmailUseCase } from "@application/use-cases/auth/verify-email";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { InvalidTokenError } from "@domain/errors";

describe("VerifyEmailUseCase", () => {
  let useCase: VerifyEmailUseCase;
  let userRepository: InMemoryUserRepository;
  const verificationToken = "valid-token";

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    useCase = new VerifyEmailUseCase(userRepository);

    await userRepository.create({
      id: "1",
      email: "test@example.com",
      password: "hashed_password",
      isVerified: false,
      verificationToken,
      createdAt: new Date(),
      firstname: "Test",
      lastname: "User",
    });
  });

  it("should verify user email with valid token", async () => {
    await useCase.execute(verificationToken);

    const user = await userRepository.findByEmail("test@example.com");
    expect(user?.isVerified).toBe(true);
    expect(user?.verificationToken).toBeNull();
  });

  it("should throw error with invalid token", async () => {
    await expect(useCase.execute("invalid-token")).rejects.toThrow(
      InvalidTokenError
    );
  });
});
