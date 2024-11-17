export interface TokenBlacklistService {
  addToBlacklist(token: string): Promise<void>;
  isBlacklisted(token: string): Promise<boolean>;
}
