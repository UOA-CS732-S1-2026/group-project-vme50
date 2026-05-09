import { describe, it, expect, vi, beforeEach } from "vitest";

/* ================= MOCKS ================= */

vi.mock("../../../repositories/mealRepository.js", () => ({
  mealRepository: {
    createMeal: vi.fn(),
    findMealById: vi.fn(),
    findActiveMeals: vi.fn(),
    saveMeal: vi.fn(),
    findMealByUser: vi.fn(),
  },
}));

/* ================= IMPORTS ================= */

import { mealRepository } from "../../../repositories/mealRepository.js";

import { createMeal, joinMeal, leaveMeal, getMeals } from "../../../services/mealService.js";

/* ================= MOCK REF ================= */

const repo = mealRepository as any;

/* ================= CONSTANT IDS ================= */

const USER_ID = "507f1f77bcf86cd799439011";
const MEAL_ID = "507f1f77bcf86cd799439012";

/* ================= TESTS ================= */

describe("Meal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ---------- CREATE ---------- */

  it("createMeal → success", async () => {
    repo.createMeal.mockResolvedValue({
      _id: "1",
      title: "Meal",
      participants: [USER_ID],
    });

    const result = await createMeal(
      {
        title: "Meal",
        description: "Test",
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

    expect(result.title).toBe("Meal");
  });

  /* ---------- JOIN ---------- */

  it("joinMeal → success", async () => {
    repo.findMealById.mockResolvedValue({
      participants: [],
      isActive: true,
      save: vi.fn(),
    });

    repo.saveMeal.mockResolvedValue(true);

    const result = await joinMeal(MEAL_ID, USER_ID);

    expect(repo.saveMeal).toHaveBeenCalled();
    expect(result.participants.length).toBe(1);
  });

  it("joinMeal → already joined", async () => {
    repo.findMealById.mockResolvedValue({
      participants: [USER_ID],
      isActive: true,
    });

    await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow("ALREADY_JOINED");
  });

  it("joinMeal → not found", async () => {
    repo.findMealById.mockResolvedValue(null);

    await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow("NOT_FOUND");
  });

  /* ---------- LEAVE ---------- */

  it("leaveMeal → success", async () => {
    repo.findMealById.mockResolvedValue({
      participants: [USER_ID, "other-user"],
      isActive: true,
      save: vi.fn(),
    });

    repo.saveMeal.mockResolvedValue(true);

    const result = await leaveMeal(MEAL_ID, USER_ID);
    const hasUser = result.participants.map((p: any) => String(p)).includes(USER_ID);

    expect(repo.saveMeal).toHaveBeenCalled();
    expect(hasUser).toBe(false);
  });

  it("leaveMeal → not in session", async () => {
    repo.findMealById.mockResolvedValue({
      participants: ["other-user"],
      isActive: true,
    });

    await expect(leaveMeal(MEAL_ID, USER_ID)).rejects.toThrow("NOT_IN_SESSION");
  });

  /* ---------- GET ---------- */

  it("getMeals → success", async () => {
    repo.findActiveMeals.mockResolvedValue([{ title: "Meal1" }]);

    const result = await getMeals();

    expect(result.length).toBe(1);
    expect(result[0]?.title).toBe("Meal1");
  });
});
