import "./config/env.js";

import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";
import { connectDB } from "./config/db.js";

/* ---------------- APP ---------------- */
const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((origin) => origin.trim()).filter(Boolean)
  : [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

/* ---------------- Routes ---------------- */
app.get("/", (req, res) => {
  res.send("Platemates API running");
});

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);

/* ---------------- SOCKET SETUP ---------------- */
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

/* ---------------- Server ---------------- */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.env.NODE_ENV !== "test") {
  startServer();
}

/* ---------------- Export for testing ---------------- */
export default app;
