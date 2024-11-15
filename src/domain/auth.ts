import {User} from "./user";

export interface AuthPayload {
  accessToken: string;
  refreshToken: string;
  user: Omit<User, 'password'>
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
