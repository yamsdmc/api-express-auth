import request from "supertest";
import { describe, it, expect, beforeEach } from "vitest";
import { createApp } from "../app";
import { Express } from "express";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import * as console from "node:console";

describe("Auth API", () => {
  const { app, userRepository } = createApp();

  const testUser = {
    email: "test@example.com",
    password: "Password123!@",
  };

  let accessToken: string;
  let refreshToken: string;
  let verificationToken: string;

  describe("Registration and Email Verification Flow", () => {
    it("should register a new user", async () => {
      const res = await insertUser(app, testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("accessToken");
      expect(res.body).toHaveProperty("refreshToken");
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user.isVerified).toBe(false);

      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    it("should not allow login before email verification", async () => {
      await insertUser(app, testUser);
      const res = await request(app).post("/api/auth/login").send(testUser);

      expect(res.status).toBe(403);
      expect(res.body.message).toBe("Email not verified");
    });

    it("should verify email", async () => {
      await insertUser(app, testUser);

      const user = await userRepository.findByEmail(testUser.email);

      verificationToken = user?.verificationToken!;

      const res = await request(app)
        .post("/api/auth/verify-email")
        .send({ token: verificationToken });

      expect(res.status).toBe(200);
    });

    it("should login successfully after verification", async () => {
      await insertUser(app, testUser);
      const userRegistered = await userRepository.findByEmail(testUser.email);

      await userRepository.update(userRegistered?.id!, { isVerified: true });
      const res = await request(app).post("/api/auth/login").send(testUser);

      expect(res.status).toBe(200);
      accessToken = res.body.accessToken;
      refreshToken = res.body.refreshToken;
    });

    describe("Resend Verification Email", () => {
      beforeEach(async () => {
        await userRepository.reset();
        await insertUser(app, testUser);
        const user = await userRepository.findByEmail(testUser.email);
        verificationToken = user?.verificationToken!;
      });
      it("should resend verification email", async () => {
        const res = await request(app)
          .post("/api/auth/resend-verification")
          .send({ email: testUser.email });

        console.log("Resend Response:", res.body); // Pour déboguer

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("Verification email sent");
      });

      it("should not resend if email is already verified", async () => {
        const user = await userRepository.findByEmail(testUser.email);
        await userRepository.update(user!.id!, { isVerified: true });

        const res = await request(app)
          .post("/api/auth/resend-verification")
          .send({ email: testUser.email });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Email already verified");
      });
      it("should return 400 with correct error when email already verified", async () => {
        // Créer et vérifier un utilisateur
        await insertUser(app, testUser);
        const user = await userRepository.findByEmail(testUser.email);
        await userRepository.update(user!.id!, { isVerified: true });

        const res = await request(app)
          .post("/api/auth/resend-verification")
          .send({ email: testUser.email });

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
          code: "AUTH_006",
          message: "Email already verified",
        });
      });

      it("should return 404 when user not found", async () => {
        const res = await request(app)
          .post("/api/auth/resend-verification")
          .send({ email: "nonexistent@example.com" });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe("User not found");
      });
    });
  });

  describe("Duplicate Registration", () => {
    it("should not register user with same email", async () => {
      await insertUser(app, testUser);
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.status).toBe(409);
      expect(res.body.message).toBe("Email already exists");
    });
  });

  describe("Protected Routes and Logout", () => {
    it("should access protected route", async () => {
      const res = await request(app)
        .get("/api/protected/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });

    it("should logout successfully", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
    });

    it("should not access protected route after logout", async () => {
      const res = await request(app)
        .get("/api/protected/profile")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/auth/me", () => {
    beforeEach(async () => {
      await (userRepository as InMemoryUserRepository).reset();
    });

    it("should get current user information when authenticated", async () => {
      await insertUser(app, testUser);
      const user = await userRepository.findByEmail(testUser.email);
      await userRepository.update(user!.id!, { isVerified: true });
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", testUser.email);
      expect(res.body).toHaveProperty("isVerified", true);
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token provided");
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token expired");
      expect(res.body.code).toBe("AUTH_003");
    });

    it("should return 401 with blacklisted token", async () => {
      await insertUser(app, testUser);
      const user = await userRepository.findByEmail(testUser.email);
      await userRepository.update(user!.id!, { isVerified: true });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const accessToken = loginRes.body.accessToken;

      await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ refreshToken: loginRes.body.refreshToken });

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid token");
      expect(res.body.code).toBe("AUTH_004");
    });
  });
  describe("DELETE /api/auth/delete-account", () => {
    beforeEach(async () => {
      await (userRepository as InMemoryUserRepository).reset();
    });

    it("should delete account with correct password", async () => {
      // Créer et connecter un utilisateur
      await insertUser(app, testUser);
      const userFounded = await userRepository.findByEmail(testUser.email);
      await userRepository.update(userFounded!.id!, { isVerified: true });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const accessToken = loginRes.body.accessToken;

      // Supprimer le compte
      const res = await request(app)
        .delete("/api/auth/delete-account")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ password: testUser.password });
      console.log(res.body);

      // expect(res.status).toBe(200);
      // expect(res.body.message).toBe('Account deleted successfully');

      // Vérifier que l'utilisateur n'existe plus
      const user = await userRepository.findByEmail(testUser.email);
      expect(user).toBeNull();
    });

    it("should return 401 with incorrect password", async () => {
      await insertUser(app, testUser);
      const user = await userRepository.findByEmail(testUser.email);
      await userRepository.update(user!.id!, { isVerified: true });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const res = await request(app)
        .delete("/api/auth/delete-account")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app)
        .delete("/api/auth/delete-account")
        .send({ password: testUser.password });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token provided");
    });

    it("should return 400 without password", async () => {
      await insertUser(app, testUser);
      const user = await userRepository.findByEmail(testUser.email);
      await userRepository.update(user!.id!, { isVerified: true });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const res = await request(app)
        .delete("/api/auth/delete-account")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});

const insertUser = async (
  app: Express,
  user: { email: string; password: string }
) => await request(app).post("/api/auth/register").send(user);
