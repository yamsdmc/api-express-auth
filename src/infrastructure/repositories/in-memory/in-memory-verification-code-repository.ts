import { VerificationCode } from "@domain/entities/verification-code";
import { VerificationCodeRepository } from "@domain/repositories/verification-code-repository";
import { VerificationCodeType } from "@domain/enums/verification-code-type";

export class InMemoryVerificationCodeRepository
  implements VerificationCodeRepository
{
  private codes: VerificationCode[] = [];

  async save(verificationCode: VerificationCode): Promise<void> {
    const existingIndex = this.codes.findIndex(
      (c) => c.id === verificationCode.id
    );
    if (existingIndex !== -1) {
      this.codes[existingIndex] = verificationCode;
    } else {
      this.codes.push(verificationCode);
    }
  }

  async findByCode(code: string): Promise<VerificationCode | null> {
    const found = this.codes.find((c) => c.code === code);
    return found || null;
  }

  async findLatestByUserId(
    userId: string,
    type: VerificationCodeType
  ): Promise<VerificationCode | null> {
    const userCodes = this.codes
      .filter((c) => c.userId === userId && c.type === type)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return userCodes[0] || null;
  }

  async markAsUsed(id: string): Promise<void> {
    const code = this.codes.find((c) => c.id === id);
    if (code) {
      code.usedAt = new Date();
    }
  }

  async clear(): Promise<void> {
    this.codes = [];
  }

  getAll(): VerificationCode[] {
    return [...this.codes];
  }
}
