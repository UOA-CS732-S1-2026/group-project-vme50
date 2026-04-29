import express from "express";
import jwt from "jsonwebtoken";

type Request = express.Request;
type Response = express.Response;
type NextFunction = express.NextFunction;

export interface JwtUserPayload extends jwt.JwtPayload {
  userId: string;
}

interface AuthRequest extends Request {
  user?: JwtUserPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtUserPayload;

    if (!decoded?.userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

export type AuthenticatedRequest = AuthRequest;
