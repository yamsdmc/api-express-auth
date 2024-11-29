import { describe, it, expect, beforeEach } from "vitest";
import {
  EmailNotVerifiedError,
  EmptyUpdateError,
  UserNotFoundError,
} from "@domain/errors";
import { UserDTO } from "@domain/DTO/UserDTO";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import {
  UpdateUserData,
  UpdateUserUseCase,
} from "@application/use-cases/user/update-user";
import { PasswordService } from "@application/services/password-service";
import { BcryptPasswordService } from "@infrastructure/services/bcrypt-password-service";

describe("UpdateUserUseCase", () => {
  let userRepository: InMemoryUserRepository;
  let updateUserUseCase: UpdateUserUseCase;
  let passwordService: PasswordService;

  const testUser: UserDTO = {
    id: "test-user-id",
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "hashed_password_123",
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    userRepository = new InMemoryUserRepository();
    passwordService = new BcryptPasswordService();
    updateUserUseCase = new UpdateUserUseCase(userRepository, passwordService);
    await userRepository.create(testUser);
  });

  describe("Validation checks", () => {
    it("should throw EmptyUpdateError when no data is provided", async () => {
      await expect(
        updateUserUseCase.execute("test-user-id", {})
      ).rejects.toThrow(EmptyUpdateError);
    });

    it("should throw UserNotFoundError when user does not exist", async () => {
      await expect(
        updateUserUseCase.execute("invalid-id", { firstname: "New Name" })
      ).rejects.toThrow(UserNotFoundError);
    });

    it("should throw EmailNotVerifiedError when user is not verified", async () => {
      const unverifiedUser = {
        ...testUser,
        id: "unverified-id",
        isVerified: false,
      };
      await userRepository.create(unverifiedUser);

      await expect(
        updateUserUseCase.execute("unverified-id", { firstname: "Jane" })
      ).rejects.toThrow(EmailNotVerifiedError);
    });
  });

  describe("Successful updates", () => {
    it("should update user firstname successfully", async () => {
      await updateUserUseCase.execute("test-user-id", { firstname: "Jane" });
      const updatedUser = await userRepository.findById("test-user-id");
      expect(updatedUser?.firstname).toBe("Jane");
    });

    it("should update user lastname successfully", async () => {
      await updateUserUseCase.execute("test-user-id", { lastname: "Smith" });
      const updatedUser = await userRepository.findById("test-user-id");
      expect(updatedUser?.lastname).toBe("Smith");
    });

    it("should update multiple fields simultaneously", async () => {
      const updateData: UpdateUserData = {
        firstname: "Jane",
        lastname: "Smith",
      };

      await updateUserUseCase.execute("test-user-id", updateData);
      const updatedUser = await userRepository.findById("test-user-id");

      expect(updatedUser).toEqual(
        expect.objectContaining({
          firstname: "Jane",
          lastname: "Smith",
        })
      );
    });

    it("should only update provided fields", async () => {
      await updateUserUseCase.execute("test-user-id", { firstname: "Jane" });
      const updatedUser = await userRepository.findById("test-user-id");

      expect(updatedUser?.firstname).toBe("Jane");
      expect(updatedUser?.lastname).toBe(testUser.lastname);
      expect(updatedUser?.password).toBe(testUser.password);
    });
  });
});
