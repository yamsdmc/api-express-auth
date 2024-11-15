export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Pour le dev uniquement

export const JWT_CONFIG = {
    ACCESS_TOKEN_EXPIRY: '1h',
    REFRESH_TOKEN_EXPIRY_DAYS: 7
};