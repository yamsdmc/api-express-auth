import { UserDTO } from "@domain/DTO/UserDTO";
import { UpdateUserData } from "@application/use-cases/user/update-user";

export interface UserRepository {
  findByEmail(email: string): Promise<UserDTO | null>;
  create(user: UserDTO): Promise<UserDTO>;
  findByVerificationToken(token: string): Promise<UserDTO | null>;
  update(id: string, data: UpdateUserData): Promise<UserDTO>;
  findById(id: string): Promise<UserDTO | null>;
  delete(id: string): Promise<void>;
}
