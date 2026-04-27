import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

import User from "../../../models/User.js";
import { userRepository } from "../../../repositories/userRepository.js";

describe("User Repository", () => {
  beforeAll(async () => {
    await connectDB();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /* ================= CREATE ================= */

  it("createUser → should insert user into DB", async () => {
    const user = await userRepository.createUser({
      name: "John",
      email: "john@aucklanduni.ac.nz",
      password: "hashed-password",
    });

    expect(user).toBeDefined();
    expect(user._id).toBeDefined();
    expect(user.email).toBe("john@aucklanduni.ac.nz");
  });

  /* ================= FIND ================= */

  it("findByEmail → should return user", async () => {
    await User.create({
      name: "John",
      email: "john@aucklanduni.ac.nz",
      password: "hashed",
    });

    const user = await userRepository.findByEmail("john@aucklanduni.ac.nz");

    expect(user).not.toBeNull();
    expect(user?.email).toBe("john@aucklanduni.ac.nz");
  });

  it("findByEmail → should return null if not found", async () => {
    const user = await userRepository.findByEmail("no@user.com");

    expect(user).toBeNull();
  });
});
