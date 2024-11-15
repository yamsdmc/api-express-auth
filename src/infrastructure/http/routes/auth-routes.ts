import { Router } from 'express';
import { AuthController } from '../controllers/auth-controller';
import {loginSchema, refreshTokenSchema, registerSchema} from "@application/validators/auth-validator";
import {validate} from "../middleware/validate";
import {authLimiter, standardLimiter} from "../middleware/rate-limit";

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
    return router;
};