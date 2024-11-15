import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 tentatives
    message: { message: 'Too many attempts, please try again later' }
});

export const standardLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100 // 100 requêtes
});