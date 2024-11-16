import {TokenService, USER_ID} from "@application/services/token-service";
import jwt from "jsonwebtoken";
import {CONFIG} from "../../config";

export class JwtTokenService implements TokenService {
    generateToken(userId: string): string {
        return jwt.sign({ userId }, CONFIG.JWT.JWT_SECRET, { expiresIn: CONFIG.JWT.ACCESS_TOKEN_EXPIRY_SECONDS });
    }

    verifyToken(token: string): USER_ID | null {
        try {
            const decoded = jwt.verify(token, CONFIG.JWT.JWT_SECRET) as { userId: string };
            return decoded.userId as USER_ID;
        } catch {
            return null;
        }
    }
}