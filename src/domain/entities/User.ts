import { UserDTO } from "@domain/DTO/UserDTO";

export class UserVO {
  private readonly id: string;
  private readonly firstname: string;
  private readonly lastname: string;
  private readonly email: string;
  private readonly password: string;
  private readonly isVerified: boolean;
  private readonly verificationToken?: string | null;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(user: UserDTO) {
    this.id = user.id;
    this.firstname = user.firstname;
    this.lastname = user.lastname;
    this.email = user.email;
    this.password = user.password;
    this.isVerified = user.isVerified;
    this.verificationToken = user.verificationToken;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }

  toDTO(): UserDTO {
    return {
      id: this.id,
      firstname: this.firstname,
      lastname: this.lastname,
      email: this.email,
      password: this.password,
      isVerified: this.isVerified,
      verificationToken: this.verificationToken,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get fullName(): string {
    return `${this.firstname} ${this.lastname}`;
  }
}
