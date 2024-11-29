import { UserRepository } from "@domain/repositories/user-repository";
import { UserDTO } from "@domain/DTO/UserDTO";
import { UpdateUserData } from "@application/use-cases/user/update-user";

export const fakeUserId = "e2d4f3a5-2a17-4d60-bd26-bc7c6e6b1f94";
export class InMemoryUserRepository implements UserRepository {
  private users: UserDTO[] = [
    {
      id: fakeUserId,
      email: "yamsdmc@gmail.com",
      password: "$2b$10$5ZFXJiMB.sWvpDc26ryQo.DW7xdvwTTfqcV.rxQlnmDM60CoR6KCy",
      isVerified: true,
      verificationToken: "93b159cf-95b0-4425-8490-ef5d47deb4df",
      createdAt: new Date("2024-11-27T09:34:46.147Z"),
      firstname: "Yamin",
      lastname: "Gherbi",
      updatedAt: new Date("2024-11-27T09:34:46.147Z"),
    },
  ];

  async findByEmail(email: string): Promise<UserDTO | null> {
    return this.users.find((user) => user.email === email) || null;
  }

  async reset(): Promise<void> {
    this.users = [];
  }

  async findByVerificationToken(token: string): Promise<UserDTO | null> {
    return this.users.find((user) => user.verificationToken === token) || null;
  }

  async create(user: UserDTO): Promise<UserDTO> {
    this.users.push(user);
    return user;
  }

  async update(id: string, data: UpdateUserData): Promise<UserDTO> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");

    this.users[index] = { ...this.users[index], ...data };
    return this.users[index];
  }

  async findById(id: string): Promise<UserDTO | null> {
    return this.users.find((user) => user.id === id) || null;
  }
  async delete(id: string): Promise<void> {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) throw new Error("User not found");
    this.users.splice(index, 1);
  }
}
