export const validateEnvironment = () => {
  const requiredEnvVars = [
    "NODE_ENV",
    "JWT_SECRET",
    "FRONTEND_URL",
    "RESEND_API_KEY",
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "PORT"
  ];

  const missingEnvVars = requiredEnvVars.filter(
    (envVar) => !process.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(
      `Missing environment variables: ${missingEnvVars.join(", ")}`
    );
  }
};
