import { UserRepository } from "@domain/repositories/user-repository";
import {
  EmailNotVerifiedError,
  EmptyUpdateError,
  UserNotFoundError,
} from "@domain/errors";
import { PasswordService } from "@application/services/password-service";

export interface UpdateUserData {
  firstname?: string;
  lastname?: string;
  password?: string;
  isVerified?: boolean;
  verificationCode?: null | string;
}

export class UpdateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private passwordService: PasswordService
  ) {}

  async execute(userId: string, data: UpdateUserData): Promise<void> {
    if (Object.keys(data).length === 0) {
      throw new EmptyUpdateError();
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }
    if (!user.isVerified) {
      throw new EmailNotVerifiedError();
    }
    const updateData: UpdateUserData = {};

    if (data.firstname !== undefined) updateData.firstname = data.firstname;
    if (data.lastname !== undefined) updateData.lastname = data.lastname;
    if (data.password !== undefined) {
      updateData.password = await this.passwordService.hash(data.password);
    }
    await this.userRepository.update(userId, updateData);
  }
}
