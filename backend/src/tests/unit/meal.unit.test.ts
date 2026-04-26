import { describe, it, expect, vi, beforeEach } from "vitest";
import mongoose from "mongoose";
import * as mealService from "../../services/mealService.js";
import MealSession from "../../models/MealSession.js";

vi.mock("../../models/MealSession.js");

const mealId = new mongoose.Types.ObjectId().toString();
const userId = new mongoose.Types.ObjectId().toString();

/* ================= HELPERS ================= */

const mockObjectId = (matchId: string) => ({
  equals: (id: string) => id === matchId,
});

const mockSession = (overrides: any = {}) => ({
  participants: [],
  slots: 2,
  isActive: true,
  save: vi.fn().mockResolvedValue(true),
  ...overrides,
});

/* ================= TEST SUITE ================= */

describe("Meal Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  /* ================= CREATE ================= */
  it("createMeal → success", async () => {
    const saveMock = vi.fn().mockResolvedValue(true);

    (MealSession.create as any) = vi.fn().mockResolvedValue({
      _id: mealId,
      save: saveMock,
    });

    const result = await mealService.createMeal(
      {
        title: "Test Meal",
        description: "desc",
        location: "Auckland",
        time: new Date(),
        slots: 2,
      },
      userId,
    );

    expect(result).toBeDefined();
  });

  /* ================= GET ================= */
  it("getMeals → success", async () => {
    const mockMeals = [{ _id: mealId, title: "Meal 1" }];

    const execMock = vi.fn().mockResolvedValue(mockMeals);

    (MealSession.find as any) = vi.fn(() => ({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      exec: execMock,
    }));

    const result = await mealService.getMeals();

    expect(result).toHaveLength(1);
  });

  /* ================= JOIN SUCCESS ================= */
  it("joinMeal → success", async () => {
    (MealSession.findById as any) = vi.fn().mockResolvedValue(
      mockSession({
        participants: [],
      }),
    );

    const result = await mealService.joinMeal(mealId, userId);

    expect(result).toBeDefined();
  });

  /* ================= JOIN ALREADY JOINED ================= */
  it("joinMeal → already joined", async () => {
    (MealSession.findById as any) = vi.fn().mockResolvedValue(
      mockSession({
        participants: [mockObjectId(userId)],
      }),
    );

    await expect(mealService.joinMeal(mealId, userId)).rejects.toThrow("ALREADY_JOINED");
  });

  /* ================= LEAVE SUCCESS ================= */
  it("leaveMeal → success", async () => {
    const session = mockSession({
      participants: [mockObjectId(userId)],
    });

    (MealSession.findById as any) = vi.fn().mockResolvedValue(session);

    const result = await mealService.leaveMeal(mealId, userId);

    expect(result).toBeDefined();
    expect(session.save).toHaveBeenCalled();
  });

  /* ================= LEAVE NOT IN SESSION ================= */
  it("leaveMeal → not in session", async () => {
    (MealSession.findById as any) = vi.fn().mockResolvedValue(
      mockSession({
        participants: [mockObjectId("other-user")],
      }),
    );

    await expect(mealService.leaveMeal(mealId, userId)).rejects.toThrow("NOT_IN_SESSION");
  });
});
