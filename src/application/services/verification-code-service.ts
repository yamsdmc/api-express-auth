import { VerificationCodeRepository } from "@domain/repositories/verification-code-repository";
import { VerificationCodeType } from "@domain/enums/verification-code-type";

export class VerificationCodeService {
  constructor(private verificationCodeRepository: VerificationCodeRepository) {}

  async generateCode(
    userId: string,
    type: VerificationCodeType,
    expiryMinutes: number = 15
  ): Promise<string> {
    const existingCode =
      await this.verificationCodeRepository.findLatestByUserId(userId, type);
    if (existingCode && existingCode.expiresAt > new Date()) {
      return existingCode.code;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    await this.verificationCodeRepository.save({
      id: crypto.randomUUID(),
      code,
      userId,
      type,
      expiresAt,
      createdAt: new Date(),
    });

    return code;
  }

  async verifyCode(
    code: string,
    userId: string,
    type: string
  ): Promise<boolean> {
    const verificationCode =
      await this.verificationCodeRepository.findByCode(code);
    console.log({ verificationCode });
    if (!verificationCode) return false;
    if (verificationCode.userId !== userId) return false;
    if (verificationCode.type !== type) return false;
    if (verificationCode.usedAt) return false;
    if (verificationCode.expiresAt < new Date()) return false;

    await this.verificationCodeRepository.markAsUsed(verificationCode.id);
    return true;
  }
}
