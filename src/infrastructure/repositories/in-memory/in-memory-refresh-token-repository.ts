import { RefreshTokenRepository } from "../../../domain/repositories/refresh-token-repository";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  private tokens: Map<string, { userId: string; expiresAt: Date }> = new Map();

  async save(
    userId: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    this.tokens.set(refreshToken, { userId, expiresAt });
  }

  async find(
    refreshToken: string
  ): Promise<{ userId: string; expiresAt: Date } | null> {
    return this.tokens.get(refreshToken) || null;
  }

  async delete(refreshToken: string): Promise<void> {
    this.tokens.delete(refreshToken);
  }
}
