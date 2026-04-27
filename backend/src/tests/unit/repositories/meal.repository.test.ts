import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

import User from "../../../models/User.js";
import MealSession from "../../../models/MealSession.js";

describe("Meal Repository", () => {
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

  /* ================= CREATE ================= */

  it("should create meal session", async () => {
    const user = await User.create({
      name: "Creator",
      email: "creator@aucklanduni.ac.nz",
      password: "hashed",
    });

    const meal = await MealSession.create({
      title: "Test Meal",
      description: "Dinner",
      location: "Auckland",
      time: new Date(Date.now() + 3600000),
      slots: 2,
      creator: user._id,
      participants: [],
    });

    expect(meal).toBeDefined();
    expect(meal.title).toBe("Test Meal");
  });

  /* ================= FIND ================= */

  it("should get all active meals", async () => {
    const user = await User.create({
      name: "Creator",
      email: "creator@aucklanduni.ac.nz",
      password: "hashed",
    });

    await MealSession.create({
      title: "Meal 1",
      description: "A",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [],
      isActive: true,
    });

    const meals = await MealSession.find({ isActive: true });

    expect(meals.length).toBe(1);
  });

  /* ================= JOIN ================= */

  it("should add participant to meal", async () => {
    const user = await User.create({
      name: "User",
      email: "user@aucklanduni.ac.nz",
      password: "hashed",
    });

    const meal = await MealSession.create({
      title: "Meal",
      description: "Test",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [],
    });

    meal.participants.push(user._id);
    await meal.save();

    const updated = await MealSession.findById(meal._id);

    expect(updated?.participants.length).toBe(1);
  });

  /* ================= REMOVE ================= */

  it("should remove participant from meal", async () => {
    const user = await User.create({
      name: "User",
      email: "user@aucklanduni.ac.nz",
      password: "hashed",
    });

    const meal = await MealSession.create({
      title: "Meal",
      description: "Test",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [user._id],
    });

    meal.participants = meal.participants.filter((p) => !p.equals(user._id));

    await meal.save();

    const updated = await MealSession.findById(meal._id);

    expect(updated?.participants.length).toBe(0);
  });
});
