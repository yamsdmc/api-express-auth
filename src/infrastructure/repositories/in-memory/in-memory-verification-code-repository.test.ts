import { VerificationCode } from "@domain/entities/verification-code";
import { VerificationCodeType } from "@domain/enums/verification-code-type";
import { InMemoryVerificationCodeRepository } from "@infrastructure/repositories/in-memory/in-memory-verification-code-repository";
import { describe, beforeEach, it, expect } from "vitest";

describe("InMemoryVerificationCodeRepository", () => {
  let repository: InMemoryVerificationCodeRepository;

  beforeEach(() => {
    repository = new InMemoryVerificationCodeRepository();
  });

  it("should save and retrieve a verification code", async () => {
    const code: VerificationCode = {
      id: "1",
      code: "123456",
      userId: "user1",
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 900000), // 15 minutes
      createdAt: new Date(),
    };

    await repository.save(code);
    const retrieved = await repository.findByCode("123456");

    expect(retrieved).toEqual(code);
  });

  it("should find latest code for user", async () => {
    const oldCode: VerificationCode = {
      id: "1",
      code: "111111",
      userId: "user1",
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 900000),
      createdAt: new Date(Date.now() - 1000),
    };

    const newCode: VerificationCode = {
      id: "2",
      code: "222222",
      userId: "user1",
      type: VerificationCodeType.EMAIL_VERIFICATION,
      expiresAt: new Date(Date.now() + 900000),
      createdAt: new Date(), // Created now
    };

    await repository.save(oldCode);
    await repository.save(newCode);

    const latest = await repository.findLatestByUserId(
      "user1",
      VerificationCodeType.EMAIL_VERIFICATION
    );
    expect(latest).toEqual(newCode);
  });
});
