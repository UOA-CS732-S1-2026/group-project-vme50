import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getHistoryPlaceholder, getNotificationsPlaceholder, getRestaurantsPlaceholder, getRewardsPlaceholder, } from "../controllers/platformController.js";
const router = express.Router();
router.get("/notifications", authMiddleware, getNotificationsPlaceholder);
router.get("/restaurants", getRestaurantsPlaceholder);
router.get("/history", authMiddleware, getHistoryPlaceholder);
router.get("/rewards", authMiddleware, getRewardsPlaceholder);
export default router;
//# sourceMappingURL=platform.js.map