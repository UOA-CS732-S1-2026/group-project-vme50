import request from "supertest";
import mongoose from "mongoose";
import app, { connectDB } from "../server.js";

import User from "../models/User.js";
import MealSession from "../models/MealSession.js";

describe("Auth API", () => {
  /* =========================================================
     TEST DATA
  ========================================================= */
  const testUser = {
    name: "Test User",
    email: "test@aucklanduni.ac.nz",
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
     REGISTER TESTS
  ========================================================= */
  describe("POST /api/auth/register", () => {
    it("should register a user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
    });

    it("should reject invalid email domain", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Bad User",
          email: "bad@gmail.com",
          password: "123456",
        });

      expect(res.statusCode).toBe(400);
    });

    it("should reject duplicate registration", async () => {
      const res1 = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      
      expect(res1.statusCode).toBe(201);
      
      const res2 = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      
      expect(res2.statusCode).toBe(400);
    });
  });

  /* =========================================================
     LOGIN TESTS
  ========================================================= */
  describe("POST /api/auth/login", () => {
    it("should login successfully", async () => {
      const res1 = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res1.statusCode).toBe(201);

      const res2 = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        });

      expect(res2.statusCode).toBe(200);
      expect(res2.body.token).toBeDefined();
    });

    it("should fail wrong password", async () => {
      await request(app).post("/api/auth/register").send(testUser);

      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpass",
        });

      expect(res.statusCode).toBe(400);
    });

    it("should fail non-existent user", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
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
      const userRes = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${userRes.body.token}`);
      
      expect(res.statusCode).toBe(200);
    });

    it("should reject requests after logout", async () => {
        const userRes = await request(app)
          .post("/api/auth/register")
          .send(testUser);
      
        await request(app)
          .post("/api/auth/logout")
          .set("Authorization", `Bearer ${userRes.body.token}`);
      
        const res = await request(app)
          .post("/api/meals/create")
          .set("Authorization", `Bearer ${userRes.body.token}`)
          .send({
            title: "Test",
            location: "Auckland",
            time: "2026-04-23T18:00:00Z",
            slots: 2,
          });
      
        expect(res.statusCode).toBe(401);
      });
  });
});