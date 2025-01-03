import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { InvalidCredentialsError } from "@domain/errors";
import { GetMeUseCase } from "@application/use-cases/user/get-me";

describe("GetMeUseCase", () => {
  let useCase: GetMeUseCase;
  let userRepository: InMemoryUserRepository;

  const testUser = {
    id: "1",
    email: "test@example.com",
    password: "hashedPassword",
    isVerified: true,
    createdAt: new Date(),
    firstname: "Test",
    lastname: "User",
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    useCase = new GetMeUseCase(userRepository);
    await userRepository.create(testUser);
  });

  it("should return user information without password", async () => {
    const result = await useCase.execute(testUser.id);

    expect(result).toEqual({
      id: testUser.id,
      email: testUser.email,
      isVerified: testUser.isVerified,
      createdAt: testUser.createdAt,
      updatedAt: testUser.updatedAt,
      firstname: testUser.firstname,
      lastname: testUser.lastname,
      fullname: `${testUser.firstname} ${testUser.lastname}`,
    });
    expect(result).not.toHaveProperty("password");
  });

  it("should throw InvalidCredentialsError if user not found", async () => {
    await expect(useCase.execute("non-existent-id")).rejects.toThrow(
      InvalidCredentialsError
    );
  });
});
