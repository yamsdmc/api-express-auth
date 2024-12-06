import { beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../app";
import { InMemoryUserRepository } from "@infrastructure/repositories/in-memory/in-memory-user-repository";
import request from "supertest";
import { Express } from "express";

describe("User API", () => {
  const { app, userRepository } = createApp("memory");

  const testUser = {
    email: "test@example.com",
    password: "Password123!@",
    firstname: "John",
    lastname: "Doe",
  };

  beforeEach(async () => {
    await (userRepository as InMemoryUserRepository).reset();
  });

  describe("GET /api/users/me", () => {
    it("should get current user information when authenticated", async () => {
      await insertUser(app, testUser);
      const user = await userRepository.findByEmail(testUser.email);
      await userRepository.update(user!.id!, { isVerified: true });
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("id");
      expect(res.body).toHaveProperty("email", testUser.email);
      expect(res.body).toHaveProperty("isVerified", true);
      expect(res.body).not.toHaveProperty("password");
    });

    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/users/me");

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("No token provided");
    });

    it("should return 401 with invalid token", async () => {
      const res = await request(app)
        .get("/api/users/me")
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
        .get("/api/users/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid token");
      expect(res.body.code).toBe("AUTH_004");
    });
  });

  describe("DELETE /api/users/delete-account", () => {
    it("should delete account with correct password", async () => {
      await insertUser(app, testUser);
      const userFounded = await userRepository.findByEmail(testUser.email);
      await userRepository.update(userFounded!.id!, { isVerified: true });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send(testUser);

      const accessToken = loginRes.body.accessToken;

      const res = await request(app)
        .delete("/api/users/delete-account")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ password: testUser.password });

      expect(res.status).toBe(200);
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
        .delete("/api/users/delete-account")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({ password: "wrongpassword" });

      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app)
        .delete("/api/users/delete-account")
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
        .delete("/api/users/delete-account")
        .set("Authorization", `Bearer ${loginRes.body.accessToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("errors");
    });
  });
});

const insertUser = async (
  app: Express,
  user: { email: string; password: string; firstname: string; lastname: string }
) => await request(app).post("/api/auth/register").send(user);
