import {User} from "../user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
  findByVerificationToken(token: string): Promise<User | null>;  // Ajouté
  update(id: string, data: Partial<User>): Promise<User>;
}
