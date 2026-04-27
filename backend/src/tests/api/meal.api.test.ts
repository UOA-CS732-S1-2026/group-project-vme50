import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../server.js";
import { connectDB } from "../../config/db.js";

import User from "../../models/User.js";
import MealSession from "../../models/MealSession.js";

describe("Meal API", () => {
  /* =========================================================
     TEST DATA
  ========================================================= */
  const testUser = {
    name: "Test User",
    email: "test@aucklanduni.ac.nz",
    password: "123456",
  };

  const testCreator = {
    name: "Creator",
    email: "creator@aucklanduni.ac.nz",
    password: "123456",
  };

  /* =========================================================
     SETUP
  ========================================================= */
  beforeAll(async () => {
    process.env.NODE_ENV = "test";
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
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.token).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.token).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res2.body.token}`)
        .send({
          title: "Test Meal",
          description: "Used for test",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      expect(mealRes.statusCode).toBe(201);
      expect(mealRes.body.session).toBeDefined();
    });

    it("should fail without token", async () => {
      const mealRes = await request(app)
        .post("/api/meals/create")
        .send({
          title: "No Auth",
          location: "Nowhere",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      expect(mealRes.statusCode).toBe(401);
    });
  });

  /* =========================================================
     GET ALL MEALS TEST
  ========================================================= */
  describe("GET /api/meals", () => {
    it("should return meals", async () => {
      const res = await request(app).get("/api/meals");

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  /* =========================================================
     JOIN MEAL TEST
  ========================================================= */
  describe("POST /api/meals/:id/join", () => {
    it("should join another user's meal session", async () => {
      const creatorRes1 = await request(app).post("/api/auth/register").send(testCreator);

      expect(creatorRes1.statusCode).toBe(201);
      expect(creatorRes1.body.token).toBeDefined();

      const creatorRes2 = await request(app).post("/api/auth/login").send({
        email: testCreator.email,
        password: testCreator.password,
      });

      expect(creatorRes2.statusCode).toBe(200);
      expect(creatorRes2.body.token).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${creatorRes2.body.token}`)
        .send({
          title: "Test Meal",
          description: "Created by creator",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      const joinerRes1 = await request(app).post("/api/auth/register").send(testUser);

      expect(joinerRes1.statusCode).toBe(201);
      expect(joinerRes1.body.token).toBeDefined();

      const joinerRes2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(joinerRes2.statusCode).toBe(200);
      expect(joinerRes2.body.token).toBeDefined();

      const joinerRes3 = await request(app)
        .post(`/api/meals/${mealRes.body.session._id}/join`)
        .set("Authorization", `Bearer ${joinerRes2.body.token}`);

      expect(joinerRes3.statusCode).toBe(200);
    });
  });

  /* =========================================================
     LEAVE MEAL TEST
  ========================================================= */
  describe("POST /api/meals/:id/leave", () => {
    it("should leave another user's meal session", async () => {
      const creatorRes1 = await request(app).post("/api/auth/register").send(testCreator);

      expect(creatorRes1.statusCode).toBe(201);
      expect(creatorRes1.body.token).toBeDefined();

      const creatorRes2 = await request(app).post("/api/auth/login").send({
        email: testCreator.email,
        password: testCreator.password,
      });

      expect(creatorRes2.statusCode).toBe(200);
      expect(creatorRes2.body.token).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${creatorRes2.body.token}`)
        .send({
          title: "Test Meal",
          description: "Created by creator",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      const leaverRes1 = await request(app).post("/api/auth/register").send(testUser);

      expect(leaverRes1.statusCode).toBe(201);
      expect(leaverRes1.body.token).toBeDefined();

      const leaverRes2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(leaverRes2.statusCode).toBe(200);
      expect(leaverRes2.body.token).toBeDefined();

      const leaverRes3 = await request(app)
        .post(`/api/meals/${mealRes.body.session._id}/join`)
        .set("Authorization", `Bearer ${leaverRes2.body.token}`);

      expect(leaverRes3.statusCode).toBe(200);

      const leaverRes4 = await request(app)
        .post(`/api/meals/${mealRes.body.session._id}/leave`)
        .set("Authorization", `Bearer ${leaverRes2.body.token}`);

      expect(leaverRes4.statusCode).toBe(200);
    });
  });
});
