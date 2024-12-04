import { UserRepository } from "@domain/repositories/user-repository";
import { UserDTO } from "@domain/DTO/UserDTO";
import { UpdateUserData } from "@application/use-cases/user/update-user";
import { pool } from "../client";
import { UserMapper } from "@infrastructure/database/postgresql/mappers/user-mapper";

export class PostgresqlUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserDTO | null> {
    const query = `
           SELECT * FROM users 
           WHERE email = $1
       `;

    const result = await pool.query(query, [email]);
    if (result.rows.length === 0) return null;

    return UserMapper.toDTO(result.rows[0]);
  }

  async create(user: UserDTO): Promise<UserDTO> {
    const query = `
           INSERT INTO users (
               id,
               email,
               password,
               firstname,
               lastname,
               is_verified,
               created_at,
               updated_at
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           RETURNING *
       `;

    const values = [
      user.id,
      user.email,
      user.password,
      user.firstname,
      user.lastname,
      user.isVerified,
      user.createdAt,
      user.updatedAt,
    ];

    const result = await pool.query(query, values);
    return UserMapper.toDTO(result.rows[0]);
  }

  async update(id: string, data: UpdateUserData): Promise<UserDTO> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${this.toSnakeCase(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    updates.push(`updated_at = $${paramCount}`);
    values.push(new Date());

    values.push(id);

    const query = `
           UPDATE users 
           SET ${updates.join(", ")}
           WHERE id = $${values.length}
           RETURNING *
       `;

    const result = await pool.query(query, values);
    if (result.rows.length === 0) throw new Error("User not found");

    return UserMapper.toDTO(result.rows[0]);
  }

  async findById(id: string): Promise<UserDTO | null> {
    const query = `
           SELECT * FROM users 
           WHERE id = $1
       `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) return null;

    return UserMapper.toDTO(result.rows[0]);
  }

  async delete(id: string): Promise<void> {
    const query = `
           DELETE FROM users 
           WHERE id = $1
           RETURNING id
       `;

    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      throw new Error("User not found");
    }
  }

  async reset(): Promise<void> {
    const query = `TRUNCATE users CASCADE`;
    await pool.query(query);
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }
}
