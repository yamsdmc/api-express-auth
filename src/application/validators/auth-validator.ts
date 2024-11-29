import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  firstname: z
    .string()
    .min(1, "Firstname is required")
    .max(100, "Firstname too long"),
  lastname: z
    .string()
    .min(1, "Lastname is required")
    .max(100, "Lastname too long"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().uuid("Invalid refresh token"),
});

export const logoutSchema = z.object({
  refreshToken: z.string().uuid("Invalid refresh token format"),
});

export const verifyEmailSchema = z.object({
  token: z.string().uuid("Invalid verification token"),
});

export const resendVerificationSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
});

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const updateUserSchema = z
  .object({
    firstname: z
      .string()
      .min(1, "Firstname is required")
      .max(100, "Firstname too long")
      .optional(),
    lastname: z
      .string()
      .min(1, "Lastname is required")
      .max(100, "Lastname too long")
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password too long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^A-Za-z0-9]/,
        "Password must contain at least one special character"
      )
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message:
      "At least one field (firstname, lastname, or password) must be provided",
  });
