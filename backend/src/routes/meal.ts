import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected route
router.post("/create", authMiddleware, (req: any, res) => {
  res.json({
    message: "You are allowed to access this route",
    user: req.user,
  });
});

export default router;