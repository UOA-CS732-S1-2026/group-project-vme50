import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createMealSession } from "../controllers/mealController.js";
import { getAllMeals } from "../controllers/mealController.js";
import { joinMealSession, leaveMealSession } from "../controllers/mealController.js";

const router = express.Router();

// CREATE meal session (protected)
router.post("/create", authMiddleware, createMealSession);

router.get("/", getAllMeals);

router.post("/:id/join", authMiddleware, joinMealSession);

router.post("/:id/leave", authMiddleware, leaveMealSession);

export default router;
