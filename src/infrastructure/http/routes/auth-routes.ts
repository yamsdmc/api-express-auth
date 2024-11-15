import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import {loginSchema, refreshTokenSchema, registerSchema} from "@application/validators/auth-validator";
import {validate} from "../middleware/validate";
import {authLimiter, standardLimiter} from "../middleware/rate-limit";
import {authMiddleware} from "@infrastructure/http/middleware/auth-middleware";

export const authRouter = (authController: AuthController): Router => {
    const router = Router();

    router.post('/register',
        authLimiter,
        validate(registerSchema),
        (req, res) =>
        authController.register(req, res)
    );
    router.post('/login',
        authLimiter,
        validate(loginSchema),
        (req, res) => authController.login(req, res)
    );

    router.post('/refresh',
        standardLimiter,
        validate(refreshTokenSchema),
        (req, res) => authController.refresh(req, res)
    );

    router.post('/logout', authMiddleware(tokenService, blacklistService), async (req, res) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        await authController.logout(req, res);
    });
    return router;
};