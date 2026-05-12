import express from "express";
import { getMyProfile, updateMyProfile, getUserProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyProfile);
router.put("/me", authMiddleware, updateMyProfile);
router.get("/:id", authMiddleware, getUserProfile);

export default router;
