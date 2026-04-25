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
      const userRes = await request(app)
        .post("/api/auth/register")
        .send(testUser);
  
      const mealRes = await request(app)
        .post("/api/meals/create")
        .set("Authorization", `Bearer ${userRes.body.token}`)
        .send({
          title: "Test Meal",
          description: "Used for test",
          location: "Auckland",
          time: "2026-04-23T18:00:00Z",
          slots: 2,
        });
  
        expect(mealRes.statusCode).toBe(201);
        expect(mealRes.body.session).toBeDefined();
    });

    it("should fail without token", async () => {
      const res = await request(app)
        .post("/api/meals/create")
        .send({
          title: "No Auth",
          location: "Nowhere",
          time: "2026-04-23T18:00:00Z",
          slots: 2,
        });

      expect(res.statusCode).toBe(401);
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
        const creatorRes = await request(app)
          .post("/api/auth/register")
          .send(testCreator);

        const mealRes = await request(app)
          .post("/api/meals/create")
          .set("Authorization", `Bearer ${creatorRes.body.token}`)
          .send({
            title: "Test Meal",
            description: "Created by creator",
            location: "Auckland",
            time: "2026-04-23T18:00:00Z",
            slots: 2,
          });
    
        const joinerRes = await request(app)
          .post("/api/auth/register")
          .send(testUser);
    
        const res = await request(app)
          .post(`/api/meals/${mealRes.body.session._id}/join`)
          .set("Authorization", `Bearer ${joinerRes.body.token}`);
    
        expect(res.statusCode).toBe(200);
    });
  });

  /* =========================================================
     LEAVE MEAL TEST
  ========================================================= */
  describe("POST /api/meals/:id/leave", () => {
    it("should leave another user's meal session", async () => {
        const creatorRes = await request(app)
          .post("/api/auth/register")
          .send(testCreator);

        const mealRes = await request(app)
          .post("/api/meals/create")
          .set("Authorization", `Bearer ${creatorRes.body.token}`)
          .send({
            title: "Test Meal",
            description: "Created by creator",
            location: "Auckland",
            time: "2026-04-23T18:00:00Z",
            slots: 2,
          });
    
        const joinerRes = await request(app)
          .post("/api/auth/register")
          .send(testUser);
    
        await request(app)
          .post(`/api/meals/${mealRes.body.session._id}/join`)
          .set("Authorization", `Bearer ${joinerRes.body.token}`);
    
        const res = await request(app)
          .post(`/api/meals/${mealRes.body.session._id}/leave`)
          .set("Authorization", `Bearer ${joinerRes.body.token}`);
    
        expect(res.statusCode).toBe(200);
      });
  });
});