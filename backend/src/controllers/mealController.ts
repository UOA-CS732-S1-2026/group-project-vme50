import type { Request, Response } from "express";
import {
  createMeal,
  getMeals,
  joinMeal,
  leaveMeal,
} from "../services/mealService.js";

export const createMealSession = async (req: any, res: Response) => {
  try {
    const session = await createMeal(req.body, req.user.userId);

    res.status(201).json({
      message: "Meal session created",
      session,
    });
  } catch {
    res.status(500).json({ message: "Error creating meal" });
  }
};

export const getAllMeals = async (_req: Request, res: Response) => {
  try {
    const meals = await getMeals();
    res.json(meals);
  } catch {
    res.status(500).json({ message: "Error fetching meals" });
  }
};

export const joinMealSession = async (req: any, res: Response) => {
  try {
    const session = await joinMeal(req.params.id, req.user.userId);
    res.json({ message: "Joined session", session });
  } catch (err: any) {
    if (err.message === "NOT_FOUND")
      return res.status(404).json({ message: "Session not found" });

    if (err.message === "ALREADY_JOINED")
      return res.status(400).json({ message: "Already joined" });

    if (err.message === "FULL")
      return res.status(400).json({ message: "Session full" });

    res.status(400).json({ message: "Cannot join session" });
  }
};

export const leaveMealSession = async (req: any, res: Response) => {
  try {
    const session = await leaveMeal(req.params.id, req.user.userId);
    res.json({ message: "Left session", session });
  } catch (err: any) {
    if (err.message === "NOT_IN_SESSION")
      return res.status(400).json({ message: "Not in session" });

    res.status(400).json({ message: "Cannot leave session" });
  }
};