import { UserRepository } from '../../../domain/repositories/user-repository'
import { User } from '../../../domain/user'

export class PostgresUserRepository implements UserRepository {
  constructor(private pool: Pool) {}

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email],
    )
    return result.rows[0] ? this.toEntity(result.rows[0]) : null
  }

  async create(user: User): Promise<User> {
    const result = await this.pool.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *',
      [user.email, user.password],
    )
    return this.toEntity(result.rows[0])
  }

  private toEntity(row: any): User {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      createdAt: row.created_at,
    }
  }
}
