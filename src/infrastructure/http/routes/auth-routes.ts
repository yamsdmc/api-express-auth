import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import {loginSchema, refreshTokenSchema, registerSchema} from "@application/validators/auth-validator";
import {validate} from "../middleware/validate";
import {authLimiter, standardLimiter} from "../middleware/rate-limit";
import {authMiddleware} from "@infrastructure/http/middleware/auth-middleware";
import {TokenBlacklistService} from "@domain/services/token-blacklist";
import {TokenService} from "@application/services/token-service";

export const authRouter = (
    authController: AuthController,
    tokenService: TokenService,
    blacklistService: TokenBlacklistService
    ): Router => {
    const router = Router();

    /**
     * @openapi
     * /api/auth/register:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Register a new user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/RegisterRequest'
     *     responses:
     *       201:
     *         description: User registered successfully
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       400:
     *         description: Invalid input
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/register',
        authLimiter,
        validate(registerSchema),
        (req, res) =>
        authController.register(req, res)
    );
    /**
     * @openapi
     * /api/auth/login:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Login user
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             $ref: '#/components/schemas/LoginRequest'
     *     responses:
     *       200:
     *         description: Login successful
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/AuthResponse'
     *       401:
     *         description: Invalid credentials
     *         content:
     *           application/json:
     *             schema:
     *               $ref: '#/components/schemas/Error'
     */
    router.post('/login',
        authLimiter,
        validate(loginSchema),
        (req, res) => authController.login(req, res)
    );
    /**
     * @openapi
     * /api/auth/refresh:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Refresh access token
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: New tokens generated
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 accessToken:
     *                   type: string
     *                 refreshToken:
     *                   type: string
     *       401:
     *         $ref: '#/components/responses/ErrorResponse'
     */
    router.post('/refresh',
        standardLimiter,
        validate(refreshTokenSchema),
        (req, res) => authController.refresh(req, res)
    );
    /**
     * @openapi
     * /api/auth/logout:
     *   post:
     *     tags:
     *       - Auth
     *     summary: Logout user
     *     security:
     *       - bearerAuth: []
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             properties:
     *               refreshToken:
     *                 type: string
     *     responses:
     *       200:
     *         description: Successfully logged out
     *         content:
     *           application/json:
     *             schema:
     *               type: object
     *               properties:
     *                 message:
     *                   type: string
     *       401:
     *         $ref: '#/components/responses/ErrorResponse'
     */
    router.post('/logout', authMiddleware(tokenService, blacklistService), async (req, res) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        await authController.logout(req, res);
    });
    return router;
};