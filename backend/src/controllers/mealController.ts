import type { Request, Response } from "express";
import { createMeal, getMeals, joinMeal, leaveMeal } from "../services/mealService.js";

import { io } from "../server.js";

/* ================= CREATE MEAL ================= */
export const createMealSession = async (req: any, res: Response) => {
  try {
    const session = await createMeal(req.body, req.user.userId);

    io.emit("mealCreated", session);

    return res.status(201).json({
      success: true,
      message: "Meal session created.",
      data: session,
    });
  } catch (_err: any) {
    return res.status(400).json({
      success: false,
      message: "Error creating meal!",
    });
  }
};

/* ================= GET ALL MEALS ================= */
export const getAllMeals = async (_req: Request, res: Response) => {
  try {
    const meals = await getMeals();

    return res.status(200).json({
      success: true,
      data: meals,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error fetching meals",
    });
  }
};

/* ================= JOIN MEAL ================= */
export const joinMealSession = async (req: any, res: Response) => {
  try {
    const session = await joinMeal(req.params.id, req.user.userId);

    io.emit("mealSlotsUpdated", {
      mealId: session._id,
      current: session.participants.length,
    });

    return res.status(200).json({
      success: true,
      message: "Joined session.",
      data: session,
    });
  } catch (_err: any) {
    if (_err.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Session not found!",
      });
    }

    if (_err.message === "ALREADY_JOINED") {
      return res.status(400).json({
        success: false,
        message: "Already joined!",
      });
    }

    if (_err.message === "FULL") {
      return res.status(400).json({
        success: false,
        message: "Session full",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cannot join session!",
    });
  }
};

/* ================= LEAVE MEAL ================= */
export const leaveMealSession = async (req: any, res: Response) => {
  try {
    const result = await leaveMeal(req.params.id, req.user.userId);

    io.emit("mealSlotsUpdated", {
      mealId: result.session._id,
      current: result.session.participants.length,
      participants: result.session.participants,
    });

    if (result.deleted) {
      io.emit("mealDeleted", result.session._id);
    }

    return res.status(200).json({
      success: true,
      message: "Left session.",
      data: result.session,
    });
  } catch (_err: any) {
    if (_err.message === "NOT_IN_SESSION") {
      return res.status(400).json({
        success: false,
        message: "Not in session!",
      });
    }

    if (_err.message === "NOT_FOUND") {
      return res.status(400).json({
        success: false,
        message: "Meal session not found!",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Error leaving session!",
    });
  }
};
