import { z } from "zod";
import {
  ProductCondition,
  ProductConditionType,
} from "@domain/value-concepts/ProductCondition";
import { ProductCategory } from "@domain/value-concepts/ProductCategory";

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
  code: z.string(),
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

export const listingFiltersSchema = z.object({
  category: z
    .enum(Object.values(ProductCategory) as [string, ...string[]])
    .optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  condition: z
    .enum(Object.values(ProductCondition) as [string, ...string[]])
    .optional(),
  query: z.string().optional(),
  offset: z.number().min(0).optional(),
  limit: z.number().min(1).optional(),
});
