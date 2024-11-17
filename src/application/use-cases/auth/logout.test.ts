import { describe, it, expect, vi, beforeEach } from "vitest";
import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { RefreshTokenRepository } from "@domain/repositories/refresh-token-repository";
import { LogoutUseCase } from "@application/use-cases/auth/logout";

describe("LogoutUseCase", () => {
  let logoutUseCase: LogoutUseCase;
  let mockBlacklist: TokenBlacklistService;
  let mockRefreshTokenRepo: RefreshTokenRepository;

  const testAccessToken = "test-access-token";
  const testRefreshToken = "test-refresh-token";

  beforeEach(() => {
    mockBlacklist = {
      addToBlacklist: vi.fn(),
      isBlacklisted: vi.fn(),
    };

    mockRefreshTokenRepo = {
      save: vi.fn(),
      find: vi.fn(),
      delete: vi.fn(),
    };

    logoutUseCase = new LogoutUseCase(mockBlacklist, mockRefreshTokenRepo);
  });

  it("should blacklist access token and delete refresh token", async () => {
    await logoutUseCase.execute(testAccessToken, testRefreshToken);

    expect(mockBlacklist.addToBlacklist).toHaveBeenCalledWith(testAccessToken);
    expect(mockRefreshTokenRepo.delete).toHaveBeenCalledWith(testRefreshToken);
  });

  it("should handle errors from blacklist service", async () => {
    mockBlacklist.addToBlacklist = vi
      .fn()
      .mockRejectedValue(new Error("Blacklist error"));

    await expect(
      logoutUseCase.execute(testAccessToken, testRefreshToken)
    ).rejects.toThrow("Blacklist error");
  });

  it("should handle errors from refresh token repository", async () => {
    mockRefreshTokenRepo.delete = vi
      .fn()
      .mockRejectedValue(new Error("Repository error"));

    await expect(
      logoutUseCase.execute(testAccessToken, testRefreshToken)
    ).rejects.toThrow("Repository error");
  });
});
