import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

import User from "../../../models/User.js";
import { userRepository } from "../../../repositories/userRepository.js";

describe("User Repository", () => {
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
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /* ================= CREATE USER TEST ================= */
  it("should insert user into DB", async () => {
    const user = await userRepository.createUser(testUser);

    expect(user).toBeDefined();
    expect(user.name).toBe(testUser.name);
    expect(user.email).toBe(testUser.email);

    const foundUser = await User.findById(user._id);

    expect(foundUser?._id.toString()).toBe(user._id.toString());
    expect(foundUser?.email).toBe(user.email);
    expect(foundUser?.name).toBe(user.name);
  });

  /* =========================================================
     FIND USER TESTS
  ========================================================= */
  describe("userRepository findByEmail", () => {
    it("should return user", async () => {
      const user = await User.create(testUser);

      const foundUser = await userRepository.findByEmail(user.email);

      expect(foundUser).toBeDefined();
      expect(foundUser?.name).toBe(user.name);
      expect(foundUser?.email).toBe(user.email);
      expect(foundUser?._id.toString()).toBe(user._id.toString());
    });

    it("should return null if not found", async () => {
      const user = await userRepository.findByEmail("nonexistent@aucklanduni.ac.nz");

      expect(user).toBeNull();
    });
  });
});
