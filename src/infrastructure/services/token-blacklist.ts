import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { CONFIG } from "../../config";

export class InMemoryTokenBlacklist implements TokenBlacklistService {
  private blacklistedTokens: Map<string, Date> = new Map();
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor() {
    this.cleanupInterval = setInterval(
      () => this.cleanup(),
      CONFIG.CLEANUP.INTERVAL_MS
    );
  }

  async addToBlacklist(token: string): Promise<void> {
    const expiryDate = new Date(
      Date.now() + CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS * 1000
    );
    this.blacklistedTokens.set(token, expiryDate);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const expiry = this.blacklistedTokens.get(token);
    if (!expiry) return false;

    if (expiry < new Date()) {
      this.blacklistedTokens.delete(token);
      return false;
    }
    return true;
  }

  private cleanup(): void {
    const now = new Date();
    for (const [token, expiry] of this.blacklistedTokens.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
      }
    }
  }

  stop(): void {
    clearInterval(this.cleanupInterval);
  }
}
