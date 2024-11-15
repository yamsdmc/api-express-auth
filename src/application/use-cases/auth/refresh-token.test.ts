import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RefreshTokenUseCase } from './refresh-token';
import { InMemoryRefreshTokenRepository } from '@infrastructure/repositories/in-memory/in-memory-refresh-token-repository';
import { JwtTokenService } from '@infrastructure/services/jwt-token-service';

describe('RefreshTokenUseCase', () => {
    let useCase: RefreshTokenUseCase;
    let refreshTokenRepository: InMemoryRefreshTokenRepository;
    let tokenService: JwtTokenService;
    let userId: string;
    let refreshToken: string;

    beforeEach(async () => {
        refreshTokenRepository = new InMemoryRefreshTokenRepository();
        tokenService = new JwtTokenService();
        useCase = new RefreshTokenUseCase(refreshTokenRepository, tokenService);

        userId = 'test-user-id';
        refreshToken = 'valid-refresh-token';
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour
        await refreshTokenRepository.save(userId, refreshToken, expiresAt);
    });

    it('should generate new token pair with valid refresh token', async () => {
        const result = await useCase.execute(refreshToken);

        expect(result.accessToken).toBeDefined();
        expect(result.refreshToken).toBeDefined();
        expect(result.refreshToken).not.toBe(refreshToken);
    });

    it('should delete old refresh token after use', async () => {
        await useCase.execute(refreshToken);
        const stored = await refreshTokenRepository.find(refreshToken);
        expect(stored).toBeNull();
    });

    it('should throw error if refresh token not found', async () => {
        await expect(
            useCase.execute('invalid-token')
        ).rejects.toThrow('Invalid refresh token');
    });

    it('should throw error if refresh token is expired', async () => {
        const expiredToken = 'expired-token';
        const expiredDate = new Date(Date.now() - 1000);
        await refreshTokenRepository.save(userId, expiredToken, expiredDate);

        await expect(
            useCase.execute(expiredToken)
        ).rejects.toThrow('Refresh token expired');
    });
});