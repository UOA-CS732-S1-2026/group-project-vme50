import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";
import metaRoutes from "./routes/meta.js";
import platformRoutes from "./routes/platform.js";
dotenv.config();
const app = express();
/* ---------------- Middleware ---------------- */
app.use(express.json());
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
}));
/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
    res.send("Platemates API running");
});
app.get("/api/test", (req, res) => {
    res.json({ message: "Backend is working!" });
});
app.get("/api", (req, res) => {
    res.json({
        message: "Platemates API index",
        docs: "/api/meta/endpoints",
        modules: ["auth", "meal", "platform"],
    });
});
app.use("/api/auth", authRoutes);
app.use("/api/meal", mealRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/platform", platformRoutes);
/* ---------------- Database ---------------- */
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
    console.log("MongoDB connected");
})
    .catch((err) => {
    console.error("MongoDB connection error:", err);
});
/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map