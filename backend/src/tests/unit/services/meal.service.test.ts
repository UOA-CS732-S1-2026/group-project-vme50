/**
 * =========================================================
 * MEAL SERVICE UNIT TESTS
 * =========================================================
 *
 * These unit tests validate the business logic inside the
 * meal service layer.
 *
 * The following dependencies are mocked:
 * - Meal Repository
 *
 * Features Tested:
 * - Meal creation
 * - Fetching active meals
 * - Joining meal sessions
 * - Preventing duplicate joins
 * - Leaving meal sessions
 * - Session validation
 * - Error handling
 *
 * Test Type:
 * - Unit Tests
 *
 * Tools:
 * - Vitest
 * - Mock Functions (vi.fn)
 * =========================================================
 */

import { describe, it, expect, vi, beforeEach } from "vitest";

/* =========================================================
   MOCKS
========================================================= */

vi.mock("../../../repositories/mealRepository.js", () => ({
  mealRepository: {
    createMeal: vi.fn(),
    findMealById: vi.fn(),
    findActiveMeals: vi.fn(),
    saveMeal: vi.fn(),
    deleteMeal: vi.fn(),
    findMealByUser: vi.fn(),
  },
}));

/* =========================================================
   IMPORTS
========================================================= */

import { mealRepository } from "../../../repositories/mealRepository.js";

import {
  createMeal,
  joinMeal,
  leaveMeal,
  getMeals,
} from "../../../services/mealService.js";

/* =========================================================
   MOCK REFERENCES
========================================================= */

const repo = mealRepository as any;

/* =========================================================
   CONSTANT IDS
========================================================= */

const USER_ID = "507f1f77bcf86cd799439011";
const OTHER_USER_ID = "507f1f77bcf86cd799439099";
const MEAL_ID = "507f1f77bcf86cd799439012";

/* =========================================================
   TEST SUITE
========================================================= */

describe("Meal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* =========================================================
     CREATE MEAL TESTS
  ========================================================= */

  describe("createMeal", () => {
    it("should create meal successfully", async () => {
      repo.createMeal.mockResolvedValue({
        _id: "1",
        title: "Meal",
        participants: [USER_ID],
      });

      const result = await createMeal(
        {
          title: "Meal",
          description: "Test description",
          location: {
            address: "Auckland",
            lat: -36.8485,
            lng: 174.7633,
          },
          time: new Date(Date.now() + 60 * 60 * 1000),
          slots: 2,
        },
        USER_ID,
      );

      expect(repo.createMeal).toHaveBeenCalledTimes(1);

      expect(result.title).toBe("Meal");
      expect(result.participants.length).toBe(1);
    });

    it("should reject past meal time", async () => {
      await expect(
        createMeal(
          {
            title: "Meal",
            description: "Test",
            location: {
              address: "Auckland",
              lat: -36.8485,
              lng: 174.7633,
            },
            time: new Date(Date.now() - 60 * 60 * 1000),
            slots: 2,
          },
          USER_ID,
        ),
      ).rejects.toThrow("INVALID_TIME");
    });
  });

  /* =========================================================
     GET MEALS TESTS
  ========================================================= */

  describe("getMeals", () => {
    it("should return active meals", async () => {
      repo.findActiveMeals.mockResolvedValue([
        {
          title: "Meal1",
        },
      ]);

      const result = await getMeals();

      expect(repo.findActiveMeals).toHaveBeenCalledTimes(1);

      expect(result.length).toBe(1);
      expect(result[0]?.title).toBe("Meal1");
    });

    it("should return empty array when no meals exist", async () => {
      repo.findActiveMeals.mockResolvedValue([]);

      const result = await getMeals();

      expect(result).toEqual([]);
    });
  });

  /* =========================================================
     JOIN MEAL TESTS
  ========================================================= */

  describe("joinMeal", () => {
    it("should join meal successfully", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [],
        isActive: true,
      });

      repo.saveMeal.mockResolvedValue(true);

      const result = await joinMeal(MEAL_ID, USER_ID);

      expect(repo.findMealById).toHaveBeenCalledWith(MEAL_ID);

      expect(repo.saveMeal).toHaveBeenCalledTimes(1);

      expect(result.participants.length).toBe(1);
    });

    it("should reject duplicate join", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [USER_ID],
        isActive: true,
      });

      await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow(
        "ALREADY_JOINED",
      );
    });

    it("should reject join for non-existent meal", async () => {
      repo.findMealById.mockResolvedValue(null);

      await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow(
        "NOT_FOUND",
      );
    });

    it("should reject join for inactive session", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [],
        isActive: false,
      });

      await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow(
        "CLOSED",
      );
    });
  });

  /* =========================================================
     LEAVE MEAL TESTS
  ========================================================= */

  describe("leaveMeal", () => {
    it("should leave meal successfully", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [USER_ID, OTHER_USER_ID],
        isActive: true,
      });

      repo.saveMeal.mockResolvedValue(true);

      const result = await leaveMeal(MEAL_ID, USER_ID);

      const hasUser = result.participants
        .map((p: any) => String(p))
        .includes(USER_ID);

      expect(repo.saveMeal).toHaveBeenCalledTimes(1);

      expect(hasUser).toBe(false);
      expect(result.participants.length).toBe(1);
    });

    it("should reject leaving when user is not in session", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [OTHER_USER_ID],
        isActive: true,
      });

      await expect(leaveMeal(MEAL_ID, USER_ID)).rejects.toThrow(
        "NOT_IN_SESSION",
      );
    });

    it("should reject leaving non-existent meal", async () => {
      repo.findMealById.mockResolvedValue(null);

      await expect(leaveMeal(MEAL_ID, USER_ID)).rejects.toThrow(
        "NOT_FOUND",
      );
    });

    it("should delete meal when last participant leaves", async () => {
      repo.findMealById.mockResolvedValue({
        participants: [USER_ID],
        isActive: true,
      });

      repo.saveMeal.mockResolvedValue(true);
      repo.deleteMeal.mockResolvedValue(true);

      await leaveMeal(MEAL_ID, USER_ID);

      expect(repo.deleteMeal).toHaveBeenCalledWith(MEAL_ID);
    });
  });
});