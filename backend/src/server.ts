import "./config/env.js";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";
import { connectDB } from "./config/db.js";

/* ---------------- APP ---------------- */
const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());

const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  }),
);

/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
  res.send("Platemates API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;

// Only start server if NOT testing
if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}

/* ---------------- Export for testing ---------------- */
export default app;
