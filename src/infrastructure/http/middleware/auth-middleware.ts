import {TokenService} from "@application/services/token-service";
import { Request, Response, NextFunction } from 'express';

declare module 'express-serve-static-core' {
    interface Request {
        userId: string;
    }
}

export const authMiddleware = (tokenService: TokenService) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.header('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            res.status(401).json({ message: 'No token provided' });
            return;
        }

        const token = authHeader.replace('Bearer ', '');
        const userId = tokenService.verifyToken(token);

        if (!userId) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        req.userId = userId;
        next();
    };
};