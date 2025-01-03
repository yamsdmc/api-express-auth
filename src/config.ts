require("dotenv").config({
  path: process.env.NODE_ENV === "production" ? ".env" : ".env.local",
});

export const CONFIG = {
  JWT: {
    SECRET: process.env.JWT_SECRET,
    ACCESS_TOKEN_EXPIRY_SECONDS: 60 * 60, // 1h in seconds
    REFRESH_TOKEN_EXPIRY_DAYS: 7,
    JWT_SECRET: process.env.JWT_SECRET,
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
    URL: process.env.APP_URL,
    NAME: "XpatMart",
  },
  EMAIL: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  },
  DATABASE: {
    POSTGRESQL: {
      HOST: process.env.DB_HOST,
      PORT: parseInt(process.env.DB_PORT || "5432"),
      USER: process.env.DB_USER,
      PASSWORD: process.env.DB_PASSWORD,
      NAME: process.env.DB_NAME,
      SSL: process.env.DB_SSL === "true",
      MAX_CONNECTIONS: parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
      IDLE_TIMEOUT: parseInt(process.env.DB_IDLE_TIMEOUT || "30000"),
    },
  },
};

export type Config = typeof CONFIG;
