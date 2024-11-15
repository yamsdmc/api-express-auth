import {TokenBlacklistService} from "@domain/services/token-blacklist";

export class InMemoryTokenBlacklist implements TokenBlacklistService {
    private blacklistedTokens: Set<string> = new Set();

    async addToBlacklist(token: string): Promise<void> {
        this.blacklistedTokens.add(token);
    }

    async isBlacklisted(token: string): Promise<boolean> {
        return this.blacklistedTokens.has(token);
    }
}