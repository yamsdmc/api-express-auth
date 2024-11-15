import {UserRepository} from "../../../domain/repositories/user-repository.js";
import {User} from "../../../domain/user.js";

export class InMemoryUserRepository implements UserRepository {
    private users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email === email) || null;
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }
}