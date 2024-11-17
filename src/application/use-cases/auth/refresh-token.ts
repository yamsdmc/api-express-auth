import { TokenPair } from "@domain/auth";
import { TokenService } from "../../services/token-service";
import { RefreshTokenRepository } from "@domain/repositories/refresh-token-repository";

export class RefreshTokenUseCase {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly tokenService: TokenService
  ) {}

  async execute(refreshToken: string): Promise<TokenPair> {
    const stored = await this.refreshTokenRepository.find(refreshToken);
    if (!stored) throw new Error("Invalid refresh token");

    if (stored.expiresAt < new Date()) {
      await this.refreshTokenRepository.delete(refreshToken);
      throw new Error("Refresh token expired");
    }

    const newAccessToken = this.tokenService.generateToken(stored.userId);
    const newRefreshToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.refreshTokenRepository.delete(refreshToken);
    await this.refreshTokenRepository.save(
      stored.userId,
      newRefreshToken,
      expiresAt
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
