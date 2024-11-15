import {User} from "../user";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>
  create(user: User): Promise<User>
}
