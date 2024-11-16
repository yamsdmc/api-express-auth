import rateLimit from "express-rate-limit";
import {CONFIG} from "../../../config";

export const authLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT.LOGIN_WINDOW_MINUTES * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development' ? 100 : CONFIG.RATE_LIMIT.LOGIN_MAX_ATTEMPTS,
    message: { message: 'Too many attempts, please try again later' }
});

export const standardLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // 100 requêtes
});