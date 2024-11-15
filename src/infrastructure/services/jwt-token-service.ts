import {TokenService, USER_ID} from "@application/services/token-service";
import {JWT_CONFIG, JWT_SECRET} from "../../config";
import jwt from "jsonwebtoken";

export class JwtTokenService implements TokenService {
    generateToken(userId: string): string {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY });
    }

    verifyToken(token: string): USER_ID | null {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
            return decoded.userId as USER_ID;
        } catch {
            return null;
        }
    }
}