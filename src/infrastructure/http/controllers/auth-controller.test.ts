import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import { AuthController } from "./auth-controller";
import { RegisterUseCase } from "@application/use-cases/auth/register";
import { LoginUseCase } from "@application/use-cases/auth/login";
import { InMemoryRefreshTokenRepository } from "../../repositories/in-memory/in-memory-refresh-token-repository";
import { RefreshTokenUseCase } from "@application/use-cases/auth/refresh-token";
import { InMemoryUserRepository } from "../../repositories/in-memory/in-memory-user-repository";
import { BcryptPasswordService } from "../../services/bcrypt-password-service";
import { JwtTokenService } from "../../services/jwt-token-service";

describe('AuthController', () => {
    let controller: AuthController;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        const userRepository = new InMemoryUserRepository();
        const passwordService = new BcryptPasswordService();
        const tokenService = new JwtTokenService();
        const refreshTokenRepository = new InMemoryRefreshTokenRepository();
        const refreshTokenUseCase = new RefreshTokenUseCase(refreshTokenRepository, tokenService);
        const registerUseCase = new RegisterUseCase(userRepository, passwordService, tokenService, refreshTokenRepository);
        const loginUseCase = new LoginUseCase(userRepository, passwordService, tokenService, refreshTokenRepository);

        controller = new AuthController(registerUseCase, loginUseCase, refreshTokenUseCase);
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
    });

    describe('register', () => {
        beforeEach(() => {
            mockRequest = {
                body: { email: 'test@example.com', password: 'password123' }
            };
        });

        it('should return 201 on successful registration', async () => {
            await controller.register(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                    user: expect.objectContaining({
                        email: 'test@example.com'
                    })
                })
            );
        });
    });

    describe('login', () => {
        beforeEach(async () => {
            mockRequest = {
                body: { email: 'test@example.com', password: 'password123' }
            };
            await controller.register(mockRequest as Request, mockResponse as Response);
        });

        it('should return 200 on successful login', async () => {
            await controller.login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    accessToken: expect.any(String),
                    refreshToken: expect.any(String),
                    user: expect.objectContaining({
                        email: 'test@example.com'
                    })
                })
            );
        });

        it('should return 401 with invalid credentials', async () => {
            mockRequest.body.password = 'wrongpassword';
            await controller.login(mockRequest as Request, mockResponse as Response);

            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Invalid credentials'
            });
        });
    });
});