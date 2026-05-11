import type { Request, Response } from "express";
import { registerUser, loginUser, logoutUser, getCurrentUser, updateCurrentUser } from "../services/authService.js";

/* ================= REGISTER ================= */
export const register = async (req: Request, res: Response) => {
  try {
    const data = await registerUser(req.body);
    return res.status(201).json(data);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= LOGIN ================= */
export const login = async (req: Request, res: Response) => {
  try {
    const data = await loginUser(req.body);
    return res.json(data);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

/* ================= LOGOUT ================= */
export const logout = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const result = await logoutUser(token);

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: "Logout failed",
      error: err.message,
    });
  }
};

export const me = async (req: any, res: Response) => {
  try {
    const data = await getCurrentUser(req.user.userId);
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  try {
    const data = await updateCurrentUser(req.user.userId, req.body);
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
