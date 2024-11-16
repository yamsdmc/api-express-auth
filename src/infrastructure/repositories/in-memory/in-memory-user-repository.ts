import {UserRepository} from "@domain/repositories/user-repository";
import {User} from "@domain/user";

export class InMemoryUserRepository implements UserRepository {
    private users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email === email) || null;
    }

    async reset(): Promise<void> {
        this.users = []
    }

    async findByVerificationToken(token: string): Promise<User | null> {
        return this.users.find(user => user.verificationToken === token) || null;
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }

    async update(id: string, data: Partial<User>): Promise<User> {
        const index = this.users.findIndex(user => user.id === id);
        if (index === -1) throw new Error('User not found');

        this.users[index] = { ...this.users[index], ...data };
        return this.users[index];
    }
}