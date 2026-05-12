/**
 * =========================================================
 * MEAL API INTEGRATION TESTS
 * =========================================================
 *
 * These integration tests validate the complete meal session
 * workflow across the full backend stack:
 *
 * Client Request
 * -> Express Routes
 * -> Authentication Middleware
 * -> Controllers
 * -> Services
 * -> MongoDB Database
 *
 * Features Tested:
 * - Meal creation
 * - Fetching meals
 * - Joining sessions
 * - Leaving sessions
 * - Authorization protection
 * - Validation handling
 * - Session deletion logic
 * - Error handling
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

const joinMeal = async (mealID: any, token: any) => {
  const res = await request(app)
    .post(`/api/meals/${mealID}/join`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);

  expect(res.body).toBeDefined;
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Joined session.");
  expect(res.body.data).toBeDefined;

  return res;
};

const leaveMeal = async (mealID: any, token: any) => {
  const res = await request(app)
    .post(`/api/meals/${mealID}/leave`)
    .set("Authorization", `Bearer ${token}`);

  expect(res.statusCode).toBe(200);

  expect(res.body).toBeDefined;
  expect(res.body.success).toBe(true);
  expect(res.body.message).toBe("Left session.");
  expect(res.body.data).toBeDefined;

  return res;
};

/* =========================================================
   TEST SUITE
========================================================= */
describe("Meal API", () => {
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
     CREATE MEAL TESTS
  ========================================================= */
  describe("POST /api/meals/create", () => {
    it("should create meal successfully", async () => {
      await register(testUser);
      const res = await login(testUser);
      await createMeal(res.body.data.token);
    });

    it("should fail without token", async () => {
      const mealRes = await request(app)
        .post("/api/meals/create")
        .send({
          title: "No Auth",
          location: {
            address: "Auckland",
            lat: -36.8485,
            lng: 174.7633,
          },
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      expect(mealRes.statusCode).toBe(401);

      expect(mealRes.body).toBeDefined;
      expect(mealRes.body.success).toBe(false);
      expect(mealRes.body.message).toBe("No token provided!");
    });

    it("should reject past meal time", async () => {
      await register(testUser);
      const res = await login(testUser);

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res.body.data.token}`)
        .send({
          title: "Test Meal",
          description: "Meal description",
          location: {
            address: "Auckland",
            lat: -36.8485,
            lng: 174.7633,
          },
          time: new Date(Date.now() - 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(400);

      expect(mealRes.body).toBeDefined();
      expect(mealRes.body.success).toBe(false);
      expect(mealRes.body.message).toBe("Error creating meal!");
    });

    it("should reject missing title", async () => {
      await register(testUser);
      const res = await login(testUser);

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res.body.data.token}`)
        .send({
          title: "",
          description: "Meal description",
          location: {
            address: "Auckland",
            lat: -36.8485,
            lng: 174.7633,
          },
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(400);

      expect(mealRes.body).toBeDefined();
      expect(mealRes.body.success).toBe(false);
      expect(mealRes.body.message).toBe("Error creating meal!");
    });

    it("should reject invalid location", async () => {
      await register(testUser);
      const res = await login(testUser);

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res.body.data.token}`)
        .send({
          title: "Meal Test",
          description: "Meal description",
          location: {},
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(400);

      expect(mealRes.body).toBeDefined();
      expect(mealRes.body.success).toBe(false);
      expect(mealRes.body.message).toBe("Error creating meal!");
    });
  });

  /* =========================================================
     GET ALL MEALS TESTS
  ========================================================= */
  describe("GET /api/meals", () => {
    it("should return meals as an array", async () => {
      const mealsRes = await request(app).get("/api/meals");

      expect(mealsRes.statusCode).toBe(200);

      expect(mealsRes.body).toBeDefined();
      expect(mealsRes.body.success).toBe(true);

      expect(mealsRes.body.data).toBeDefined();
      expect(Array.isArray(mealsRes.body.data)).toBe(true);
    });

    it("should return correct number of meals", async () => {
      await register(testUser);
      const res = await login(testUser);

      const mealsRes1 = await request(app).get("/api/meals");

      expect(mealsRes1.statusCode).toBe(200);

      expect(mealsRes1.body).toBeDefined();
      expect(mealsRes1.body.success).toBe(true);

      expect(mealsRes1.body.data).toBeDefined();
      expect(mealsRes1.body.data.length).toBe(0);

      await createMeal(res.body.data.token);

      const mealsRes2 = await request(app).get("/api/meals");

      expect(mealsRes2.statusCode).toBe(200);

      expect(mealsRes2.body).toBeDefined();
      expect(mealsRes2.body.success).toBe(true);

      expect(mealsRes2.body.data).toBeDefined();
      expect(mealsRes2.body.data.length).toBe(1);
    });
  });

  /* =========================================================
     JOIN MEAL TESTS
  ========================================================= */
  describe("POST /api/meals/:id/join", () => {
    it("should join another user's meal session", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const joinerRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      await joinMeal(mealRes.body.data._id, joinerRes1.body.data.token);
    });

    it("should reject duplicate join", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const joinerRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      await joinMeal(mealRes.body.data._id, joinerRes1.body.data.token);

      const joinerRes2 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/join`)
        .set("Authorization", `Bearer ${joinerRes1.body.data.token}`);

      expect(joinerRes2.statusCode).toBe(400);

      expect(joinerRes2.body).toBeDefined;
      expect(joinerRes2.body.success).toBe(false);
      expect(joinerRes2.body.message).toBe("Already joined!");
    });

    it("should reject joining non-existent meal", async () => {
      await register(testUser);
      const joinerRes1 = await login(testUser);

      const joinerRes2 = await request(app)
        .post(`/api/meals/${new mongoose.Types.ObjectId()}/join`)
        .set("Authorization", `Bearer ${joinerRes1.body.data.token}`);

      expect(joinerRes2.statusCode).toBe(404);

      expect(joinerRes2.body).toBeDefined;
      expect(joinerRes2.body.success).toBe(false);
      expect(joinerRes2.body.message).toBe("Session not found!");
    });

    it("should reject invalid meal id", async () => {
      await register(testUser);
      const joinerRes1 = await login(testUser);

      const joinerRes2 = await request(app)
        .post(`/api/meals/invalid-id}/join`)
        .set("Authorization", `Bearer ${joinerRes1.body.data.token}`);

      expect(joinerRes2.statusCode).toBe(400);

      expect(joinerRes2.body).toBeDefined;
      expect(joinerRes2.body.success).toBe(false);
      expect(joinerRes2.body.message).toBe("Cannot join session!");
    });

    it("should reject join without token", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      const res = await request(app).post(`/api/meals/${mealRes.body.data._id}/join`);

      expect(res.statusCode).toBe(401);

      expect(res.body).toBeDefined();
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("No token provided!");
    });
  });

  /* =========================================================
     LEAVE MEAL TESTS
  ========================================================= */
  describe("POST /api/meals/:id/leave", () => {
    it("should leave meal session successfully", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const leaverRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      await joinMeal(mealRes.body.data._id, leaverRes1.body.data.token);
      await leaveMeal(mealRes.body.data._id, leaverRes1.body.data.token);
    });

    it("should reject leaving without joining", async () => {
      await register(testCreator);
      const creatorRes = await login(testCreator);

      await register(testUser);
      const leaverRes1 = await login(testUser);

      const mealRes = await createMeal(creatorRes.body.data.token);

      const leaverRes2 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/leave`)
        .set("Authorization", `Bearer ${leaverRes1.body.data.token}`);

      expect(leaverRes2.statusCode).toBe(400);

      expect(leaverRes2.body).toBeDefined();
      expect(leaverRes2.body.success).toBe(false);
      expect(leaverRes2.body.message).toBe("Not in session!");
    });

    it("should reject leaving in non-existent meal session", async () => {
      await register(testUser);
      const leaverRes1 = await login(testUser);

      const leaverRes2 = await request(app)
        .post(`/api/meals/${new mongoose.Types.ObjectId()}/leave`)
        .set("Authorization", `Bearer ${leaverRes1.body.data.token}`);

      expect(leaverRes2.statusCode).toBe(400);

      expect(leaverRes2.body).toBeDefined();
      expect(leaverRes2.body.success).toBe(false);
      expect(leaverRes2.body.message).toBe("Meal session not found!");
    });

    it("should reject leave with invalid meal ID", async () => {
      await register(testUser);
      const leaverRes1 = await login(testUser);

      const leaverRes2 = await request(app)
        .post(`/api/meals/invalid-id/leave`)
        .set("Authorization", `Bearer ${leaverRes1.body.data.token}`);

      expect(leaverRes2.statusCode).toBe(400);

      expect(leaverRes2.body).toBeDefined();
      expect(leaverRes2.body.success).toBe(false);
      expect(leaverRes2.body.message).toBe("Error leaving session!");
    });

    it("should delete meal when all participants leave", async () => {
      await register(testUser);
      const leaverRes = await login(testUser);

      const mealRes = await createMeal(leaverRes.body.data.token);

      expect(mealRes.body.data.participants.length).toBe(1);

      await leaveMeal(mealRes.body.data._id, leaverRes.body.data.token);

      const deletedMeal = await MealSession.findById(mealRes.body.data._id);

      expect(deletedMeal).toBeNull();
    });

    it("should reject leave without token", async () => {
      await register(testUser);
      const leaverRes1 = await login(testUser);

      const mealRes = await createMeal(leaverRes1.body.data.token);

      const leaverRes2 = await request(app).post(`/api/meals/${mealRes.body.data._id}/leave`);

      expect(leaverRes2.statusCode).toBe(401);

      expect(leaverRes2.body).toBeDefined();
      expect(leaverRes2.body.success).toBe(false);
      expect(leaverRes2.body.message).toBe("No token provided!");
    });
  });
});
