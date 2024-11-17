export const CONFIG = {
  JWT: {
    SECRET: process.env.JWT_SECRET || "your-secret-key", // Only for dev
    ACCESS_TOKEN_EXPIRY_SECONDS: 60 * 60, // 1h in seconds
    REFRESH_TOKEN_EXPIRY_DAYS: 7,
    JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  },
  CLEANUP: {
    INTERVAL_MS: 60 * 60 * 1000, // 1h in milliseconds
    TOKEN_RETENTION_DAYS: 1, // How long to keep expired tokens
  },
  RATE_LIMIT: {
    LOGIN_MAX_ATTEMPTS: 5,
    LOGIN_WINDOW_MINUTES: 15,
    STANDARD_MAX_REQUESTS: 100,
    STANDARD_WINDOW_MINUTES: 1,
  },
  APP: {
    URL: process.env.APP_URL || "http://localhost:3000",
    NAME: "YourApp",
  },
  EMAIL: {
    HOST: process.env.EMAIL_HOST || "smtp.example.com",
    PORT: parseInt(process.env.EMAIL_PORT || "587"),
    USER: process.env.EMAIL_USER || "your-email@example.com",
    PASSWORD: process.env.EMAIL_PASSWORD || "your-password",
    FROM: process.env.EMAIL_FROM || "noreply@yourapp.com",
  },
};

export type Config = typeof CONFIG;
