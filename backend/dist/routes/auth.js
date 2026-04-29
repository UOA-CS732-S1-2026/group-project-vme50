import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { register, login, logout, getCurrentUser, updateProfile, } from "../controllers/authController.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, getCurrentUser);
router.patch("/profile", authMiddleware, updateProfile);
export default router;
//# sourceMappingURL=auth.js.map