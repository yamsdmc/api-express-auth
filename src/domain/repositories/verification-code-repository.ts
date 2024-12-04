import { VerificationCode } from "@domain/entities/verification-code";

export interface VerificationCodeRepository {
  save(verificationCode: VerificationCode): Promise<void>;
  findByCode(code: string): Promise<VerificationCode | null>;
  findLatestByUserId(
    userId: string,
    type: string
  ): Promise<VerificationCode | null>;
  markAsUsed(id: string): Promise<void>;
}
