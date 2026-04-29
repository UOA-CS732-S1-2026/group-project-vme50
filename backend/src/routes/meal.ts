import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  closeMealSession,
  createMealSession,
  getAllMeals,
  getMealById,
  getMyHostedMeals,
  getMyJoinedMeals,
  joinMealSession,
  leaveMealSession,
} from "../controllers/mealController.js";

const router = express.Router();

router.get("/", getAllMeals);
router.get("/mine/hosting", authMiddleware, getMyHostedMeals);
router.get("/mine/joined", authMiddleware, getMyJoinedMeals);
router.post("/create", authMiddleware, createMealSession);
router.get("/:id", getMealById);
router.post("/:id/join", authMiddleware, joinMealSession);
router.post("/:id/leave", authMiddleware, leaveMealSession);
router.post("/:id/close", authMiddleware, closeMealSession);

export default router;
