import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Auth API",
      version: "1.0.0",
      description: "Authentication API documentation",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
          required: ["email", "password"],
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            refreshToken: { type: "string" },
            user: {
              type: "object",
              properties: {
                id: { type: "string" },
                email: { type: "string" },
                createdAt: { type: "string", format: "date-time" },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            code: { type: "string" },
            message: { type: "string" },
          },
        },
      },
    },
  },
  apis: ["./src/infrastructure/http/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
