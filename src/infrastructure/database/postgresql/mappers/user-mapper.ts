import { UserDTO } from "@domain/DTO/UserDTO";
import { UserVO } from "@domain/entities/User";

export class UserMapper {
  static toDomain(row: any): UserVO {
    const dto: UserDTO = {
      id: row.id,
      email: row.email,
      password: row.password,
      firstname: row.firstname,
      lastname: row.lastname,
      isVerified: row.is_verified,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };

    return new UserVO(dto);
  }
  static toDTO(row: any): UserDTO {
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstname: row.firstname,
      lastname: row.lastname,
      isVerified: row.is_verified,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  static toDB(vo: UserVO): any {
    const dto = vo.toDTO();
    return {
      id: dto.id,
      email: dto.email,
      password: dto.password,
      firstname: dto.firstname,
      lastname: dto.lastname,
      is_verified: dto.isVerified,
      created_at: dto.createdAt,
      updated_at: dto.updatedAt,
    };
  }
}
