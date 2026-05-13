import http from "http";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
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

const configuredOrigins = [
  process.env.CLIENT_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CLIENT_URLS?.split(",").map((value) => value.trim()) ?? []),
].filter(Boolean);

const allowedOriginPatterns = [
  /^http:\/\/localhost:517\d$/,
  /^http:\/\/127\.0\.0\.1:517\d$/,
  /^https:\/\/.*\.vercel\.app$/,
];

const isAllowedOrigin = (origin?: string) => {
  if (!origin) {
    return true;
  }

  if (configuredOrigins.includes(origin)) {
    return true;
  }

  return allowedOriginPatterns.some((pattern) => pattern.test(origin));
};

const corsOrigin = (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
  if (isAllowedOrigin(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: corsOrigin,
    credentials: true,
  },
});

setSocketServer(io);

/* ---------------- Middleware ---------------- */
app.use(express.json());

app.use(
  cors({
    origin: corsOrigin,
  }),
);

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

const isExecutedDirectly = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (process.env.NODE_ENV !== "test" && isExecutedDirectly) {
  void startServer();
}
