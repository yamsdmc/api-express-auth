import { TokenService } from "@application/services/token-service";
import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { Request, Response, NextFunction } from 'express';
import {InvalidTokenError, TokenExpiredError} from "@domain/errors";

declare module 'express-serve-static-core' {
    interface Request {
        userId: string;
    }
}

export const authMiddleware = (
    tokenService: TokenService,
    blacklistService: TokenBlacklistService
) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                res.status(401).json({ message: 'No token provided' });
                return
            }

            const isBlacklisted = await blacklistService.isBlacklisted(token);
            if (isBlacklisted) {
                throw new InvalidTokenError();
            }

            const userId = tokenService.verifyToken(token);
            if (!userId) {
                throw new TokenExpiredError();
            }

            req.userId = userId;
            next();
        } catch (err) {
            next(err);
        }
    };
};


// export const authMiddleware = (
//     tokenService: TokenService,
//     blacklistService: TokenBlacklistService
// ) => {
//     return async (req: Request, res: Response, next: NextFunction) => {
//         const token = req.header('Authorization')?.replace('Bearer ', '');
//         if (!token) return res.status(401).json({ message: 'No token provided' });
//
//         const isBlacklisted = await blacklistService.isBlacklisted(token);
//         if (isBlacklisted) return res.status(401).json({ message: 'Token is invalid' });
//
//         const userId = tokenService.verifyToken(token);
//         if (!userId) return res.status(401).json({ message: 'Invalid token' });
//
//         req.userId = userId;
//         next();
//     };
// };