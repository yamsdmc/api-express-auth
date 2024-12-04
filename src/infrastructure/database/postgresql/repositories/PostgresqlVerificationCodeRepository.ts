import { VerificationCode } from "@domain/entities/verification-code";
import { VerificationCodeRepository } from "@domain/repositories/verification-code-repository";
import { VerificationCodeType } from "@domain/enums/verification-code-type";
import { pool } from "../client";

export class PostgresqlVerificationCodeRepository
  implements VerificationCodeRepository
{
  async save(verificationCode: VerificationCode): Promise<void> {
    const query = `
            INSERT INTO verification_codes (id, code, user_id, type, expires_at, created_at)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE
            SET code = $2,
                user_id = $3,
                type = $4,
                expires_at = $5
        `;

    await pool.query(query, [
      verificationCode.id,
      verificationCode.code,
      verificationCode.userId,
      verificationCode.type,
      verificationCode.expiresAt,
      verificationCode.createdAt,
    ]);
  }

  async findByCode(code: string): Promise<VerificationCode | null> {
    const query = `
            SELECT * FROM verification_codes 
            WHERE code = $1 
            AND used_at IS NULL
            AND expires_at > CURRENT_TIMESTAMP
            LIMIT 1
        `;

    const result = await pool.query(query, [code]);
    if (result.rows.length === 0) return null;

    return this.mapToEntity(result.rows[0]);
  }

  async findLatestByUserId(
    userId: string,
    type: VerificationCodeType
  ): Promise<VerificationCode | null> {
    const query = `
            SELECT * FROM verification_codes
            WHERE user_id = $1 
            AND type = $2
            AND used_at IS NULL
            AND expires_at > CURRENT_TIMESTAMP
            ORDER BY created_at DESC
            LIMIT 1
        `;

    const result = await pool.query(query, [userId, type]);
    if (result.rows.length === 0) return null;

    return this.mapToEntity(result.rows[0]);
  }

  async markAsUsed(id: string): Promise<void> {
    const query = `
            UPDATE verification_codes
            SET used_at = CURRENT_TIMESTAMP
            WHERE id = $1
        `;

    await pool.query(query, [id]);
  }

  private mapToEntity(row: any): VerificationCode {
    return {
      id: row.id,
      code: row.code,
      userId: row.user_id,
      type: row.type as VerificationCodeType,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
      usedAt: row.used_at ? new Date(row.used_at) : undefined,
    };
  }
}
