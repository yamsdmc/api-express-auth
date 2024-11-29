import { TokenService } from "@application/services/token-service";
import { TokenBlacklistService } from "@domain/services/token-blacklist";
import { Request, Response, NextFunction } from "express";
import { InvalidTokenError, TokenExpiredError } from "@domain/errors";

export const authMiddleware = (
  tokenService: TokenService,
  blacklistService: TokenBlacklistService
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      console.log("authMiddleware");
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        console.log("No token provided");
        res.status(401).json({ message: "No token provided" });
        return;
      }

      const isBlacklisted = await blacklistService.isBlacklisted(token);
      if (isBlacklisted) {
        console.log("InvalidTokenError");
        throw new InvalidTokenError();
      }

      const userId = tokenService.verifyToken(token);
      console.log({ userId });
      if (!userId) {
        console.log("InvalidTokenError");
        throw new TokenExpiredError();
      }

      req.userId = userId;
      next();
    } catch (err) {
      next(err);
    }
  };
};
