import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import { InMemoryRefreshTokenRepository } from "@infrastructure/repositories/in-memory/in-memory-refresh-token-repository";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";
import { InMemoryProductListingRepository } from "@infrastructure/repositories/in-memory/in-memory-product-listing-repository";
import { PostgresqlProductListingRepository } from "@infrastructure/database/postgresql/repositories/PostgresqlProductListingRepository";
import { PostgresqlVerificationCodeRepository } from "@infrastructure/database/postgresql/repositories/PostgresqlVerificationCodeRepository";
import { PostgresqlRefreshTokenRepository } from "@infrastructure/database/postgresql/repositories/PostgresqlRefreshTokenRepository";
import { PostgresqlUserRepository } from "@infrastructure/database/postgresql/repositories/PostgresqlUserRepository";
import { InMemoryTokenBlacklist } from "@infrastructure/services/token-blacklist";
import { PostgresqlTokenBlacklist } from "@infrastructure/database/postgresql/repositories/PostgresqlTokenBlacklist";

export type StorageType = "memory" | "postgresql";

export class RepositoryFactory {
  constructor(private storageType: StorageType) {}

  createUserRepository() {
    return this.storageType === "memory"
      ? new InMemoryUserRepository()
      : new PostgresqlUserRepository();
  }

  createRefreshTokenRepository() {
    return this.storageType === "memory"
      ? new InMemoryRefreshTokenRepository()
      : new PostgresqlRefreshTokenRepository();
  }

  createVerificationCodeRepository() {
    return this.storageType === "memory"
      ? new InMemoryVerificationCodeRepository()
      : new PostgresqlVerificationCodeRepository();
  }

  createProductListingRepository() {
    return this.storageType === "memory"
      ? new InMemoryProductListingRepository()
      : new PostgresqlProductListingRepository();
  }

  createTokenBlacklist() {
    return this.storageType === "memory"
      ? new InMemoryTokenBlacklist()
      : new PostgresqlTokenBlacklist();
  }
}
