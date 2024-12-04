import { RefreshTokenRepository } from "@domain/repositories/refresh-token-repository";
import { pool } from "../client";

export class PostgresqlRefreshTokenRepository
  implements RefreshTokenRepository
{
  async save(
    userId: string,
    refreshToken: string,
    expiresAt: Date
  ): Promise<void> {
    const query = `
            INSERT INTO refresh_tokens (
                token,
                user_id,
                expires_at
            ) VALUES ($1, $2, $3)
            ON CONFLICT (token) DO UPDATE
            SET user_id = $2,
                expires_at = $3
        `;

    await pool.query(query, [refreshToken, userId, expiresAt]);
  }

  async find(
    refreshToken: string
  ): Promise<{ userId: string; expiresAt: Date } | null> {
    const query = `
            SELECT user_id, expires_at 
            FROM refresh_tokens 
            WHERE token = $1
        `;

    const result = await pool.query(query, [refreshToken]);

    if (result.rows.length === 0) {
      return null;
    }

    return {
      userId: result.rows[0].user_id,
      expiresAt: new Date(result.rows[0].expires_at),
    };
  }

  async delete(refreshToken: string): Promise<void> {
    const query = `
            DELETE FROM refresh_tokens 
            WHERE token = $1
        `;

    await pool.query(query, [refreshToken]);
  }

  async deleteExpired(): Promise<number | null> {
    const query = `
            DELETE FROM refresh_tokens 
            WHERE expires_at < CURRENT_TIMESTAMP
            RETURNING token
        `;

    const result = await pool.query(query);
    return result.rowCount;
  }
}
