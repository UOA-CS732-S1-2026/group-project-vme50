import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";

interface AuthRequest extends Request {
  user?: string | jwt.JwtPayload;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const blacklisted = await Blacklist.findOne({ token });

    if (blacklisted) {
      return res.status(401).json({ message: "Token is invalid (logged out)" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    req.user = decoded;
    next();
  } catch (_err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
