import "./config/env.js";

import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import mealRoutes from "./routes/meal.js";
import { connectDB } from "./config/db.js";
import userRoutes from "./routes/user.js";

/* ---------------- APP ---------------- */
const app = express();

/* ---------------- Middleware ---------------- */
app.use(express.json());

const allowedOrigin = /https:\/\/.*\.vercel\.app$|http:\/\/localhost:5173/;

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
app.use("/api/users", userRoutes);

/* ---------------- SOCKET SETUP ---------------- */
const server = http.createServer(app);

export const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
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
