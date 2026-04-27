import { describe, it, expect, vi, beforeEach } from "vitest";

/* ================= MOCKS ================= */

vi.mock("../../../models/MealSession.js", () => ({
  default: {
    create: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
  },
}));

/* ================= IMPORTS ================= */

import Meal from "../../../models/MealSession.js";

import { createMeal, joinMeal, leaveMeal, getMeals } from "../../../services/mealService.js";

/* ================= MOCK REF ================= */

const mockMeal = Meal as any;

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
    mockMeal.create.mockResolvedValue({
      _id: "1",
      title: "Meal",
    });

    const result = await createMeal(
      {
        title: "Meal",
        description: "Test",
        location: "Auckland",
        time: new Date(),
        slots: 2,
      },
      USER_ID,
    );

    expect(result.title).toBe("Meal");
  });

  /* ---------- JOIN ---------- */

  it("joinMeal → success", async () => {
    const saveMock = vi.fn();

    mockMeal.findById.mockResolvedValue({
      participants: [],
      slots: 2,
      isActive: true,
      save: saveMock,
    });

    await joinMeal(MEAL_ID, USER_ID);

    expect(saveMock).toHaveBeenCalled();
  });

  it("joinMeal → already joined", async () => {
    mockMeal.findById.mockResolvedValue({
      participants: [{ toString: () => USER_ID }],
      slots: 2,
      isActive: true,
    });

    await expect(joinMeal(MEAL_ID, USER_ID)).rejects.toThrow("ALREADY_JOINED");
  });

  /* ---------- LEAVE ---------- */

  it("leaveMeal → success", async () => {
    const saveMock = vi.fn();

    mockMeal.findById.mockResolvedValue({
      participants: [{ toString: () => USER_ID }, { toString: () => "507f1f77bcf86cd799439099" }],
      isActive: true,
      save: saveMock,
    });

    await leaveMeal(MEAL_ID, USER_ID);

    expect(saveMock).toHaveBeenCalled();
  });

  it("leaveMeal → not in session", async () => {
    mockMeal.findById.mockResolvedValue({
      participants: [{ toString: () => "507f1f77bcf86cd799439099" }],
      isActive: true,
    });

    await expect(leaveMeal(MEAL_ID, USER_ID)).rejects.toThrow("NOT_IN_SESSION");
  });

  /* ---------- GET ---------- */

  it("getMeals → success", async () => {
    mockMeal.find.mockReturnValue({
      populate: () => ({
        sort: () => ({
          exec: vi.fn().mockResolvedValue([{ title: "Meal1" }]),
        }),
      }),
    });

    const result = await getMeals();

    expect(result.length).toBe(1);
  });
});
