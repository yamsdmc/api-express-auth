export interface RefreshTokenRepository {
    save(userId: string, refreshToken: string, expiresAt: Date): Promise<void>;
    find(refreshToken: string): Promise<{ userId: string; expiresAt: Date; } | null>;
    delete(refreshToken: string): Promise<void>;
}