import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createMealSession,
  getAllMeals,
  getMealSessionById,
  getMyHostingMeals,
  getMyJoinedMeals,
  joinMealSession,
  leaveMealSession,
  closeMealSession,
} from "../controllers/mealController.js";

const router = express.Router();

// CREATE meal session (protected)
router.post("/create", authMiddleware, createMealSession);

router.get("/", getAllMeals);
router.get("/mine/hosting", authMiddleware, getMyHostingMeals);
router.get("/mine/joined", authMiddleware, getMyJoinedMeals);
router.get("/:id", getMealSessionById);

router.post("/:id/join", authMiddleware, joinMealSession);

router.post("/:id/leave", authMiddleware, leaveMealSession);
router.post("/:id/close", authMiddleware, closeMealSession);

export default router;
