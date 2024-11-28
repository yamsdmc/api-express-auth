import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { BcryptPasswordService } from "@infrastructure/services/bcrypt-password-service";
import { InvalidCredentialsError } from "@domain/errors";
import { DeleteAccountUseCase } from "@application/use-cases/auth/delete-account";

describe("DeleteAccountUseCase", () => {
  let useCase: DeleteAccountUseCase;
  let userRepository: InMemoryUserRepository;
  let passwordService: BcryptPasswordService;
  const password = "password123";
  let hashedPassword: string;

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    passwordService = new BcryptPasswordService();
    useCase = new DeleteAccountUseCase(userRepository, passwordService);

    hashedPassword = await passwordService.hash(password);
    await userRepository.create({
      id: "1",
      email: "test@example.com",
      password: hashedPassword,
      isVerified: true,
      createdAt: new Date(),
        firstname: "Test",
        lastname: "User",
    });
  });

  it("should delete account with correct password", async () => {
    await useCase.execute("1", password);

    const user = await userRepository.findById("1");
    expect(user).toBeNull();
  });

  it("should throw error with incorrect password", async () => {
    await expect(useCase.execute("1", "wrongpassword")).rejects.toThrow(
      InvalidCredentialsError
    );

    const user = await userRepository.findById("1");
    expect(user).toBeDefined();
  });

  it("should throw error with non-existent user", async () => {
    await expect(useCase.execute("non-existent-id", password)).rejects.toThrow(
      InvalidCredentialsError
    );
  });
});
