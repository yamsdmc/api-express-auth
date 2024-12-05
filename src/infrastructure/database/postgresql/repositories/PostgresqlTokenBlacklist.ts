import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { pool } from "../client";
import { CONFIG } from "../../../../config";

export class PostgresqlTokenBlacklist implements TokenBlacklistService {
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

    const query = `
            INSERT INTO blacklisted_tokens (token, expiry_date)
            VALUES ($1, $2)
            ON CONFLICT (token) DO UPDATE
            SET expiry_date = $2
        `;

    await pool.query(query, [token, expiryDate]);
  }

  async isBlacklisted(token: string): Promise<boolean> {
    const query = `
            SELECT EXISTS (
                SELECT 1 
                FROM blacklisted_tokens 
                WHERE token = $1 
                AND expiry_date > CURRENT_TIMESTAMP
            )
        `;

    const result = await pool.query(query, [token]);
    return result.rows[0].exists;
  }

  private async cleanup(): Promise<void> {
    const query = `
            DELETE FROM blacklisted_tokens 
            WHERE expiry_date <= CURRENT_TIMESTAMP
        `;

    await pool.query(query);
  }

  stop(): void {
    clearInterval(this.cleanupInterval);
  }
}
