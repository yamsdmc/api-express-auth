export type USER_ID = string;

export interface TokenService {
  generateToken(userId: string): string;
  verifyToken(token: string): USER_ID | null;
}
