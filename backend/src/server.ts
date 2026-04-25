import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";

/* ---------------- ENV SETUP ---------------- */
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" });
} else {
  dotenv.config();
}

const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
  res.send("Platemates API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);

/* ---------------- Database ---------------- */
export const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(MONGO_URI);

    console.log(
      `MongoDB connected (${process.env.NODE_ENV || "development"})`
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

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