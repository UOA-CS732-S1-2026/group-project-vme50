import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Platemates API running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

app.use(cors({
  origin: "http://localhost:5173"
}));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});