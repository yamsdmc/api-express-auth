import { User } from "@domain/user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(user: User): Promise<User>;
  findByVerificationToken(token: string): Promise<User | null>;
  update(id: string, data: Partial<User>): Promise<User>;
  findById(id: string): Promise<User | null>;
  delete(id: string): Promise<void>;
}
