import { VerificationCodeType } from "@domain/enums/verification-code-type";

export interface VerificationCode {
  id: string;
  code: string;
  userId: string;
  type: VerificationCodeType;
  expiresAt: Date;
  createdAt: Date;
  usedAt?: Date;
}
