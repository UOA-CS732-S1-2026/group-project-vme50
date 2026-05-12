import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";
import metaRoutes from "./routes/meta.js";
import platformRoutes from "./routes/platform.js";
import { connectDB } from "./config/db.js";
import { setSocketServer } from "./socket.js";
dotenv.config();
const app = express();
const httpServer = http.createServer(app);
const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
].filter(Boolean);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        credentials: true,
    },
});
setSocketServer(io);
/* ---------------- Middleware ---------------- */
app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
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
app.use("/api/meals", mealRoutes);
app.use("/api/meta", metaRoutes);
app.use("/api/platform", platformRoutes);
export default app;
export const startServer = async () => {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    io.on("connection", (socket) => {
        socket.emit("connected", { ok: true });
    });
    return httpServer.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};
if (process.env.NODE_ENV !== "test") {
    void startServer();
}
//# sourceMappingURL=server.js.map