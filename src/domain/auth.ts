import { UserDTO } from "@domain/DTO/UserDTO";

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Omit<UserDTO, "password">;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
