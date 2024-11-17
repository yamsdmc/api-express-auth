import { RefreshTokenRepository } from "@domain/repositories/refresh-token-repository";
import { TokenBlacklistService } from "@domain/services/token-blacklist";

export class LogoutUseCase {
  constructor(
    private readonly blacklist: TokenBlacklistService,
    private readonly refreshTokenRepository: RefreshTokenRepository
  ) {}

  async execute(accessToken: string, refreshToken: string): Promise<void> {
    await this.blacklist.addToBlacklist(accessToken);
    await this.refreshTokenRepository.delete(refreshToken);
  }
}
