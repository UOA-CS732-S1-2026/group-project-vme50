import type { Request, Response } from "express";
import {
  createMeal,
  getMeals,
  getMealById,
  joinMeal,
  leaveMeal,
  closeMeal,
  getHostingMeals,
  getJoinedMeals,
} from "../services/mealService.js";

import { io } from "../server.js";

const loadDetailedSessionOrFallback = async (sessionId: string, fallbackSession: any) => {
  try {
    return await getMealById(sessionId);
  } catch (error: any) {
    if (error?.message === "NOT_FOUND") {
      return fallbackSession;
    }

    throw error;
  }
};

const loadDetailedSessionOrNull = async (sessionId: string) => {
  try {
    return await getMealById(sessionId);
  } catch (error: any) {
    if (error?.message === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
};

/* ================= CREATE MEAL ================= */
export const createMealSession = async (req: any, res: Response) => {
  try {
    const session = await createMeal(req.body, req.user.userId);

    return res.status(201).json({
      success: true,
      message: "Meal session created",
      data: session,
    });
  } catch (_err: any) {
    if (_err.message === "INVALID_TIME") {
      return res.status(400).json({
        success: false,
        message: "Please choose a future time for your session",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error creating meal",
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

export const getMealSessionById = async (req: Request, res: Response) => {
  try {
    const mealId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mealId) {
      return res.status(400).json({
        success: false,
        message: "Session id is required",
      });
    }

    const session = await getMealById(mealId);

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message === "NOT_FOUND" ? "Session not found" : "Error fetching session",
    });
  }
};

/* ================= JOIN MEAL ================= */
export const joinMealSession = async (req: any, res: Response) => {
  try {
    const session = await joinMeal(req.params.id, req.user.userId);
    const responseSession = await loadDetailedSessionOrFallback(req.params.id, session);

    io.emit("mealSlotsUpdated", {
      mealId: session._id,
      current: session.participants.length,
    });

    return res.status(200).json({
      success: true,
      message: "Joined session",
      data: responseSession,
    });
  } catch (_err: any) {
    if (_err.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (_err.message === "ALREADY_JOINED") {
      return res.status(400).json({
        success: false,
        message: "Already joined",
      });
    }

    if (_err.message === "FULL") {
      return res.status(400).json({
        success: false,
        message: "Session full",
      });
    }

    if (_err.message === "CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Session closed",
      });
    }

    if (_err.message === "ALREADY_IN_OTHER_SESSION") {
      return res.status(400).json({
        success: false,
        message: "You are already in another active session",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cannot join session",
    });
  }
};

/* ================= LEAVE MEAL ================= */
export const leaveMealSession = async (req: any, res: Response) => {
  try {
    const session = await leaveMeal(req.params.id, req.user.userId);
    const responseSession = await loadDetailedSessionOrNull(req.params.id);

    if (responseSession) {
      io.emit("mealSlotsUpdated", {
        mealId: session._id,
        current: session.participants.length,
      });
    } else {
      io.emit("mealRemoved", {
        mealId: req.params.id,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Left session",
      data: responseSession,
      deleted: !responseSession,
      sessionId: req.params.id,
    });
  } catch (_err: any) {
    if (_err.message === "NOT_IN_SESSION") {
      return res.status(400).json({
        success: false,
        message: "Not in session",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cannot leave session",
    });
  }
};

export const closeMealSession = async (req: any, res: Response) => {
  try {
    const session = await closeMeal(req.params.id, req.user.userId);
    const responseSession = await loadDetailedSessionOrFallback(req.params.id, session);

    return res.status(200).json({
      success: true,
      message: "Session closed",
      data: responseSession,
    });
  } catch (err: any) {
    if (err.message === "NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    if (err.message === "FORBIDDEN") {
      return res.status(403).json({
        success: false,
        message: "Only the host can close this session",
      });
    }

    if (err.message === "ALREADY_CLOSED") {
      return res.status(400).json({
        success: false,
        message: "Session already closed",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Cannot close session",
    });
  }
};

export const getMyHostingMeals = async (req: any, res: Response) => {
  try {
    const sessions = await getHostingMeals(req.user.userId);

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error fetching hosting sessions",
    });
  }
};

export const getMyJoinedMeals = async (req: any, res: Response) => {
  try {
    const sessions = await getJoinedMeals(req.user.userId);

    return res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch {
    return res.status(500).json({
      success: false,
      message: "Error fetching joined sessions",
    });
  }
};
