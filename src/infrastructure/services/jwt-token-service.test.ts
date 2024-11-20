import { describe, it, expect, beforeEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import { JwtTokenService } from "@infrastructure/services/jwt-token-service";
import { CONFIG } from "../../config";

describe("JwtTokenService", () => {
  let jwtService: JwtTokenService;
  const testUserId = "test-user-123";

  beforeEach(() => {
    jwtService = new JwtTokenService();
  });

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = jwtService.generateToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, CONFIG.JWT.JWT_SECRET) as {
        userId: string;
      };
      expect(decoded.userId).toBe(testUserId);
    });

    it("should set correct expiration time", () => {
      const token = jwtService.generateToken(testUserId);
      const decoded = jwt.decode(token) as { exp: number; iat: number };

      const expectedExp = Math.floor(
        decoded.iat + CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS
      );
      expect(decoded.exp).toBe(expectedExp);
    });
  });

  describe("verifyToken", () => {
    it("should return userId for valid token", () => {
      const token = jwtService.generateToken(testUserId);
      const result = jwtService.verifyToken(token);

      expect(result).toBe(testUserId);
    });

    it("should return null for invalid token", () => {
      const result = jwtService.verifyToken("invalid-token");
      expect(result).toBeNull();
    });

    it("should return null for expired token", () => {
      const realDateNow = Date.now.bind(global.Date);
      const currentTime = Date.now();

      vi.spyOn(global.Date, "now").mockImplementation(
        () => currentTime - CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS * 2000
      );

      const expiredToken = jwtService.generateToken(testUserId);

      global.Date.now = realDateNow;

      const result = jwtService.verifyToken(expiredToken);
      expect(result).toBeNull();
    });
  });
});
