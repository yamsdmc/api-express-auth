import {UserDTO} from "@domain/DTO/UserDTO";

export interface UserRepository {
  findByEmail(email: string): Promise<UserDTO | null>;
  create(user: UserDTO): Promise<UserDTO>;
  findByVerificationToken(token: string): Promise<UserDTO | null>;
  update(id: string, data: Partial<UserDTO>): Promise<UserDTO>;
  findById(id: string): Promise<UserDTO | null>;
  delete(id: string): Promise<void>;
}
