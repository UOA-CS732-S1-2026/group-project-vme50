import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../../server.js";
import { connectDB } from "../../config/db.js";

import User from "../../models/User.js";
import MealSession from "../../models/MealSession.js";

describe("Auth API", () => {
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
      const res = await request(app).post("/api/auth/register").send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toBeDefined();
    });

    it("should reject invalid email domain", async () => {
      const res = await request(app).post("/api/auth/register").send({
        name: "Invalid User",
        email: "invalid@gmail.com",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
    });

    it("should reject duplicate registration", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/register").send(testUser);

      expect(res2.statusCode).toBe(400);
    });
  });

  /* =========================================================
     LOGIN TESTS
  ========================================================= */
  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data).toBeDefined();
    });

    it("should fail wrong password", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpass",
      });

      expect(res2.statusCode).toBe(400);
    });

    it("should fail non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@aucklanduni.ac.nz",
        password: "123456",
      });

      expect(res.statusCode).toBe(400);
    });
  });

  /* =========================================================
     LOGOUT TEST
  ========================================================= */
  describe("POST /api/auth/logout", () => {
    it("should logout successfully", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data).toBeDefined();

      const res3 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${res2.body.data.token}`);

      expect(res3.statusCode).toBe(200);
    });

    it("should reject create meal session request after logout", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data).toBeDefined();

      const res3 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${res2.body.data.token}`);

      expect(res3.statusCode).toBe(200);

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res2.body.data.token}`)
        .send({
          title: "Create Meal Test",
          description: "Create meal after logout",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(401);
    });

    it("should reject join meal session request after logout", async () => {
      const creatorRes1 = await request(app).post("/api/auth/register").send(testCreator);

      expect(creatorRes1.statusCode).toBe(201);
      expect(creatorRes1.body.data).toBeDefined();

      const creatorRes2 = await request(app).post("/api/auth/login").send({
        email: testCreator.email,
        password: testCreator.password,
      });

      expect(creatorRes2.statusCode).toBe(200);
      expect(creatorRes2.body.data).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${creatorRes2.body.data.token}`)
        .send({
          title: "Join Meal Test",
          description: "Meal to join.",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(201);
      expect(mealRes.body.data).toBeDefined();

      const joinerRes1 = await request(app).post("/api/auth/register").send(testUser);

      expect(joinerRes1.statusCode).toBe(201);
      expect(joinerRes1.body.data).toBeDefined();

      const joinerRes2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(joinerRes2.statusCode).toBe(200);
      expect(joinerRes2.body.data).toBeDefined();

      const joinerRes3 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${joinerRes2.body.data.token}`);

      expect(joinerRes3.statusCode).toBe(200);

      const joinerRes4 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/join`)
        .set("Authorization", `Bearer ${joinerRes2.body.data.token}`);

      expect(joinerRes4.statusCode).toBe(401);
    });

    it("should reject leave meal session request after logout", async () => {
      const creatorRes1 = await request(app).post("/api/auth/register").send(testCreator);

      expect(creatorRes1.statusCode).toBe(201);
      expect(creatorRes1.body.data).toBeDefined();

      const creatorRes2 = await request(app).post("/api/auth/login").send({
        email: testCreator.email,
        password: testCreator.password,
      });

      expect(creatorRes2.statusCode).toBe(200);
      expect(creatorRes2.body.data).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${creatorRes2.body.data.token}`)
        .send({
          title: "Leave Meal Test",
          description: "Meal to leave.",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 5,
        });

      expect(mealRes.statusCode).toBe(201);
      expect(mealRes.body.data).toBeDefined();

      const leaverRes1 = await request(app).post("/api/auth/register").send(testUser);

      expect(leaverRes1.statusCode).toBe(201);
      expect(leaverRes1.body.data).toBeDefined();

      const leaverRes2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(leaverRes2.statusCode).toBe(200);
      expect(leaverRes2.body.data).toBeDefined();

      const leaverRes3 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/join`)
        .set("Authorization", `Bearer ${leaverRes2.body.data.token}`);

      expect(leaverRes3.statusCode).toBe(200);

      const leaverRes4 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${leaverRes2.body.data.token}`);

      expect(leaverRes4.statusCode).toBe(200);

      const leaverRes5 = await request(app)
        .post(`/api/meals/${mealRes.body.data._id}/leave`)
        .set("Authorization", `Bearer ${leaverRes2.body.data.token}`);

      expect(leaverRes5.statusCode).toBe(401);
    });

    it("should allow new token after logout", async () => {
      const res1 = await request(app).post("/api/auth/register").send(testUser);

      expect(res1.statusCode).toBe(201);
      expect(res1.body.data).toBeDefined();

      const res2 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.data).toBeDefined();

      const res3 = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${res2.body.data.token}`);

      expect(res3.statusCode).toBe(200);

      const res4 = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res4.statusCode).toBe(200);
      expect(res4.body.data).toBeDefined();

      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${res4.body.data.token}`)
        .send({
          title: "New token works",
          description: "valid",
          location: "Auckland",
          time: new Date(Date.now() + 3600000).toISOString(),
          slots: 2,
        });

      expect(mealRes.statusCode).toBe(201);
    });
  });
});
