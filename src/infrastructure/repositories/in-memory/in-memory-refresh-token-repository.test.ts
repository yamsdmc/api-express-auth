import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRefreshTokenRepository } from "./in-memory-refresh-token-repository";

describe("InMemoryRefreshTokenRepository", () => {
  let repository: InMemoryRefreshTokenRepository;
  let userId: string;
  let refreshToken: string;
  let expiresAt: Date;

  beforeEach(() => {
    repository = new InMemoryRefreshTokenRepository();
    userId = "test-user-id";
    refreshToken = "test-refresh-token";
    expiresAt = new Date();
  });

  describe("save", () => {
    it("should save refresh token with user id and expiry", async () => {
      await repository.save(userId, refreshToken, expiresAt);
      const result = await repository.find(refreshToken);

      expect(result).toEqual({
        userId,
        expiresAt,
      });
    });
  });

  describe("find", () => {
    it("should return null for non-existent token", async () => {
      const result = await repository.find("non-existent");
      expect(result).toBeNull();
    });

    it("should find saved token", async () => {
      await repository.save(userId, refreshToken, expiresAt);
      const result = await repository.find(refreshToken);
      expect(result?.userId).toBe(userId);
    });
  });

  describe("delete", () => {
    it("should delete existing token", async () => {
      await repository.save(userId, refreshToken, expiresAt);
      await repository.delete(refreshToken);
      const result = await repository.find(refreshToken);
      expect(result).toBeNull();
    });

    it("should not throw when deleting non-existent token", async () => {
      await expect(repository.delete("non-existent")).resolves.not.toThrow();
    });
  });
});
