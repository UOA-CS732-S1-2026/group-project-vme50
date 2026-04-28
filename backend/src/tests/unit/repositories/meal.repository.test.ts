import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

import User from "../../../models/User.js";
import MealSession from "../../../models/MealSession.js";
import { mealRepository } from "../../../repositories/mealRepository.js";

describe("Meal Repository", () => {
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
    await MealSession.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  /* ================= CREATE MEAL TEST ================= */
  it("should create meal session", async () => {
    const user = await User.create(testUser);

    const meal = await mealRepository.createMeal({
      title: "Test Meal",
      description: "Dinner",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [user._id],
      isActive: true,
    });

    expect(meal).toBeDefined();
    expect(meal.title).toBe("Test Meal");
    expect(meal.description).toBe("Dinner");
    expect(meal.location).toBe("Auckland");
    expect(meal.creator).toBe(user._id);
    expect(meal.participants).toStrictEqual([user._id]);
    expect(meal.isActive).toBe(true);
  });

  /* ================= GET ACTIVE MEALS TEST ================= */
  it("should get all active meals", async () => {
    const user = await User.create(testUser);

    const mealA = await MealSession.create({
      title: "Old Meal",
      description: "A",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [],
      isActive: true,
    });

    const mealB = await MealSession.create({
      title: "New Meal",
      description: "B",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [],
      isActive: true,
    });

    const meals = await mealRepository.findActiveMeals();

    expect(meals).toBeDefined();
    expect(meals.length).toBe(2);
    expect(meals[0]?._id.toString()).toBe(mealB._id.toString());
    expect(meals[1]?._id.toString()).toBe(mealA._id.toString());
  });

  /* ================= FIND MEAL BY ID TEST ================= */
  it("should find meal by id", async () => {
    const user = await User.create(testUser);

    const meal = await MealSession.create({
      title: "Find Me",
      description: "Test",
      location: "Auckland",
      time: new Date(),
      slots: 2,
      creator: user._id,
      participants: [user._id],
      isActive: true,
    });

    const foundMeal = await mealRepository.findMealById(meal._id.toString());

    expect(foundMeal).toBeDefined();
    expect(foundMeal?._id.toString()).toBe(meal._id.toString());
  });

  /* =========================================================
     UPDATE MEAL TESTS
  ========================================================= */
  describe("Meal Session Updates", () => {
    it("should save updated meal session (participant joined)", async () => {
      const user = await User.create(testUser);

      const meal = await MealSession.create({
        title: "Meal",
        description: "Test",
        location: "Auckland",
        time: new Date(),
        slots: 2,
        creator: user._id,
        participants: [],
        isActive: true,
      });

      meal.participants.push(user._id);
      let foundMeal = await mealRepository.findMealById(meal._id.toString());

      expect(foundMeal?.participants.length).toBe(0);

      await mealRepository.saveMeal(meal);
      foundMeal = await mealRepository.findMealById(meal._id.toString());

      expect(foundMeal?.participants.length).toBe(1);
      expect(foundMeal?.participants[0]?.toString()).toBe(user._id.toString());
    });

    it("should save updated meal session (participant left)", async () => {
      const user = await User.create(testUser);

      const meal = await MealSession.create({
        title: "Meal",
        description: "Test",
        location: "Auckland",
        time: new Date(),
        slots: 2,
        creator: user._id,
        participants: [user._id],
        isActive: true,
      });

      meal.participants = meal.participants.filter((p: any) => !p.equals(user._id));
      let foundMeal = await mealRepository.findMealById(meal._id.toString());

      expect(foundMeal?.participants.length).toBe(1);

      await mealRepository.saveMeal(meal);
      foundMeal = await mealRepository.findMealById(meal._id.toString());

      expect(foundMeal?.participants.length).toBe(0);
    });
  });
});
