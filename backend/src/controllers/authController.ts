import type { Request, Response } from "express";
import { registerUser, loginUser, logoutUser } from "../services/authService.js";

// REGISTER
export const register = async (req: Request, res: Response) => {
  try {
    const token = await registerUser(req.body);
    return res.status(201).json({ token });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// LOGIN
export const login = async (req: Request, res: Response) => {
  try {
    const token = await loginUser(req.body);
    return res.json({ token });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    await logoutUser(token);

    return res.status(200).json({ message: "Logged out successfully" });
  } catch (_err) {
    return res.status(500).json({ message: "Logout failed" });
  }
};
