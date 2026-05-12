/**
 * =========================================================
 * AUTHENTICATION API INTEGRATION TESTS
 * =========================================================
 *
 * These tests validate the complete authentication flow:
 *
 * Client Request
 * -> Express Routes
 * -> Middleware
 * -> Controllers
 * -> Services
 * -> MongoDB
 *
 * Includes:
 * - Register
 * - Login
 * - Logout
 * - JWT validation
 * - Token blacklist invalidation
 * - Protected route authorization
 *
 * Tools:
 * - Vitest
 * - Supertest
 * - MongoDB
 * =========================================================
 */
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import app from "../../server.js";
import { connectDB } from "../../config/db.js";

import User from "../../models/User.js";
import MealSession from "../../models/MealSession.js";

/* =========================================================
   HELPERS
========================================================= */
const register = async (user: any) => {
  const res = await request(app).post("/api/auth/register").send(user);

  expect(res.statusCode).toBe(201);

  expect(res.body).toBeDefined();
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("User registered successfully.");

  expect(res.body.data).toBeDefined();
  expect(res.body.data.token).toBeDefined();
  expect(res.body.data.user).toMatchObject({
    name: user.name,
    email: user.email,
  });

  expect(res.body.data.user.id).toBeDefined();
  expect(res.body.data.user.password).toBeUndefined();

  return res;
};

const login = async (user: any) => {
  const res = await request(app).post("/api/auth/login").send({
    email: user.email,
    password: user.password,
  });

  expect(res.statusCode).toBe(200);

  expect(res.body).toBeDefined();
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Login successful.");

  expect(res.body.data).toBeDefined();
  expect(res.body.data.token).toBeDefined();
  expect(res.body.data.user).toMatchObject({
    name: user.name,
    email: user.email,
  });

  expect(res.body.data.user.id).toBeDefined();
  expect(res.body.data.user.password).toBeUndefined();

  return res;
};

const logout = async (token: any) => {
  const res = await request(app).post("/api/auth/logout").set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);

  expect(res.body).toBeDefined();
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Logged out successfully.");

  return res;
};

const createMeal = async (token: any) => {
  const mealRes = await request(app)
    .post("/api/meals/create")
    .set("Authorization", `Bearer ${token}`)
    .send({
      title: "Test Meal",
      description: "Meal description",
      location: {
        address: "Auckland",
        lat: -36.8485,
        lng: 174.7633,
      },
      time: new Date(Date.now() + 3600000).toISOString(),
      slots: 5,
    });

  expect(mealRes.statusCode).toBe(201);

  expect(mealRes.body).toBeDefined();
  expect(mealRes.body.success).toBe(true);
  expect(mealRes.body.message).toBe("Meal session created.");

  expect(mealRes.body.data).toBeDefined();

  return mealRes;
};

/* =========================================================
   TEST SUITE
========================================================= */
describe("Auth API", () => {
  /* =========================================================
     TEST DATA
  ========================================================= */
  const testUser = {
    name: "Test User",
    email: "test123@aucklanduni.ac.nz",
    password: "123456",
  };

  const testCreator = {
    name: "Creator",
    email: "test321@aucklanduni.ac.nz",
    password: "123456",
  };

  /* =========================================================
     SETUP
  ========================================================= */
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await MealSession.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /* =========================================================
     REGISTER TESTS
  ========================================================= */
  describe("POST /api/auth/register", () => {
    it("should register a user successfully", async () => {
      await register(testUser);
    });

    it("should reject duplicate registration", async () => {
      await register(testUser);

      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User already exists!");
    });

    it("should reject invalid email domain", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "InvalidDomain User",
        email: "abcd123@gmail.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Only University of Auckland students can register!");
    });

    it("should reject invalid UPI format", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "InvalidUPI User",
        email: "abc123@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid UPI format!");
    });

    it("should reject missing name", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "test123@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
    });

    it("should reject missing email", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "MissingEmail User",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
    });

    it("should reject missing password", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "MissingPassword User",
        email: "test123@aucklanduni.ac.nz",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
    });

    it("should generate valid JWT token", async () => {
      const res = await register(testUser);

      const token = res.body.data.token;
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

      expect(decoded.userId).toBeDefined();
      expect(decoded.jti).toBeDefined();
    });
  });

  /* =========================================================
     LOGIN TESTS
  ========================================================= */
  describe("POST /api/auth/login", () => {
    it("should login a user successfully", async () => {
      await register(testUser);
      await login(testUser);
    });

    it("should fail wrong password", async () => {
      await register(testUser);

      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpass",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid credentials!");
    });

    it("should fail non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "none123@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("User not found!");
    });

    it("should reject missing email", async () => {
      const res = await request(app).post("/api/auth/login").send({
        password: "123456",
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
    });

    it("should reject missing password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
      });

      expect(res.statusCode).toBe(400);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
    });

    it("should generate unique tokens for each login", async () => {
      await register(testUser);

      const res1 = await login(testUser);
      const res2 = await login(testUser);

      expect(res1.body.data.token).not.toBe(res2.body.data.token);
    });
  });

  /* =========================================================
     LOGOUT TESTS
  ========================================================= */
  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      await register(testUser);
      const res = await login(testUser);
      await logout(res.body.data.token);
    });

    it("should reject logout without token", async () => {
      const res = await request(app).post("/api/auth/logout");

      expect(res.statusCode).toBe(401);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided!");
    });

    it("should reject logout with invalid token", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", "Bearer invalidToken");

      expect(res.statusCode).toBe(401);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid or expired token!");
    });

    it("should reject already blacklisted token", async () => {
      await register(testUser);
      const res1 = await login(testUser);

      await logout(res1.body.data.token);
      const res2 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${res1.body.data.token}`);

      expect(res2.statusCode).toBe(401);

      expect(res2.body).toBeDefined();
      expect(res2.body.success).toBe(false);
      expect(res2.body.message).toBe("Token is invalid (logged out)!");
    });

    it("should reject create meal session request after logout", async () => {
      await register(testUser);
      const res1 = await login(testUser);
      await logout(res1.body.data.token);

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res1.body.data.token}`)
        .send({
          title: "Test Meal",
          description: "Meal description",
          location: {
            address: "Auckland",
            lat: -36.8485,
            lng: 174.7633,
          },
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(401);

      expect(mealRes.body).toBeDefined();
      expect(mealRes.body.success).toBe(false);
      expect(mealRes.body.message).toBe("Token is invalid (logged out)!");
    });

    it("should reject join meal session request after logout", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const joinerRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      await logout(joinerRes1.body.data.token);

      const joinerRes2 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/join`)
        .set("Authorization", `Bearer ${joinerRes1.body.data.token}`);

      expect(joinerRes2.statusCode).toBe(401);

      expect(joinerRes2.body).toBeDefined();
      expect(joinerRes2.body.success).toBe(false);
      expect(joinerRes2.body.message).toBe("Token is invalid (logged out)!");
    });

    it("should reject leave meal session request after logout", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const leaverRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      const leaverRes2 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/join`)
        .set("Authorization", `Bearer ${leaverRes1.body.data.token}`);

      expect(leaverRes2.statusCode).toBe(200);

      expect(leaverRes2.body).toBeDefined();
      expect(leaverRes2.body.success).toBe(true);
      expect(leaverRes2.body.message).toBe("Joined session.");

      expect(leaverRes2.body.data).toBeDefined();

      await logout(leaverRes1.body.data.token);

      const leaverRes3 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/leave`)
        .set("Authorization", `Bearer ${leaverRes1.body.data.token}`);

      expect(leaverRes3.statusCode).toBe(401);

      expect(leaverRes3.body).toBeDefined();
      expect(leaverRes3.body.success).toBe(false);
      expect(leaverRes3.body.message).toBe("Token is invalid (logged out)!");
    });

    it("should allow new token after logout", async () => {
      await register(testUser);
      const res1 = await login(testUser);
      await logout(res1.body.data.token);

      const res3 = await login(testUser);
      await createMeal(res3.body.data.token);
    });
  });
});
