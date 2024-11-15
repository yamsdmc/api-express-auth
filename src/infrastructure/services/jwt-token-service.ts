import {TokenService} from "../../application/services/token-service";
import {JWT_CONFIG, JWT_SECRET} from "../../config";
import jwt from "jsonwebtoken";

export class JwtTokenService implements TokenService {
    generateToken(userId: string): string {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY });
    }

    verifyToken(token: string): string | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            return decoded.userId;
        } catch {
            return null;
        }
    }
}