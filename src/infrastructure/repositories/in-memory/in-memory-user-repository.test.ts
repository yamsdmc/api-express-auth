import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryUserRepository } from "./in-memory-user-repository";
import { UserDTO } from "@domain/DTO/UserDTO";

describe("InMemoryUserRepository", () => {
  let repository: InMemoryUserRepository;
  let testUser: UserDTO;

  beforeEach(() => {
    repository = new InMemoryUserRepository();
    testUser = {
      id: "1",
      email: "test@example.com",
      password: "password123",
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      firstname: "Test",
      lastname: "User",
    };
  });

  describe("create", () => {
    it("should create a user and return it", async () => {
      const created = await repository.create(testUser);
      expect(created).toEqual(testUser);
    });

    it("should store the user in memory", async () => {
      await repository.create(testUser);
      const found = await repository.findByEmail(testUser.email);
      expect(found).toEqual(testUser);
    });
  });

  describe("findByEmail", () => {
    it("should return null when user not found", async () => {
      const user = await repository.findByEmail("nonexistent@example.com");
      expect(user).toBeNull();
    });

    it("should find user by email", async () => {
      await repository.create(testUser);
      const found = await repository.findByEmail(testUser.email);
      expect(found).toEqual(testUser);
    });
  });
});
