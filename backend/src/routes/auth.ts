import express from "express";
import { register, login, logout, me, updateProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);
router.get("/me", authMiddleware, me);
router.patch("/profile", authMiddleware, updateProfile);

export default router;
