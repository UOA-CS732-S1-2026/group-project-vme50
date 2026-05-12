import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Blacklist from "../models/Blacklist.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const buildToken = (userId: string) =>
  jwt.sign({ userId, jti: randomUUID() }, process.env.JWT_SECRET!, { expiresIn: "7d" });

const sanitizeUser = (user: {
  _id: unknown;
  name: string;
  email: string;
  bio?: string;
  favoriteCuisine?: string;
  yearOfStudy?: string;
  avatarColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  bio: user.bio ?? "",
  favoriteCuisine: user.favoriteCuisine ?? "",
  yearOfStudy: user.yearOfStudy ?? "",
  avatarColor: user.avatarColor ?? "#2e7d61",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const buildAuthPayload = (token: string, user: ReturnType<typeof sanitizeUser>) => ({
  token,
  user,
});

const failure = (res: any, status: number, message: string) =>
  res.status(status).json({ success: false, message });

const success = (res: any, status: number, message: string, data?: unknown) =>
  res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(data && typeof data === "object" && "token" in (data as Record<string, unknown>)
      ? data
      : {}),
    ...(data && typeof data === "object" && "user" in (data as Record<string, unknown>)
      ? { user: (data as any).user }
      : {}),
  });

// REGISTER
export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedName = String(name || "").trim();
    const normalizedPassword = String(password || "");
    const upiRegex = /^[A-Za-z]{4}\d{3}@aucklanduni\.ac\.nz$/;

    if (!normalizedName) {
      return failure(res, 400, "Name is required!");
    }

    if (!normalizedEmail.endsWith("@aucklanduni.ac.nz")) {
      return failure(res, 400, "Only University of Auckland students can register!");
    }

    if (!upiRegex.test(normalizedEmail)) {
      return failure(res, 400, "Invalid UPI format!");
    }

    if (!normalizedPassword || normalizedPassword.length < 6) {
      return failure(res, 400, "Password must be at least 6 characters!");
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return failure(res, 400, "User already exists!");
    }

    const hashedPassword = await bcrypt.hash(normalizedPassword, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = buildToken(String(user._id));

    const payload = buildAuthPayload(token, sanitizeUser(user));

    return success(res, 201, "User registered successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Server error!");
  }
};

// LOGIN
export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();
    const normalizedPassword = String(password || "");

    if (!normalizedEmail || !normalizedPassword) {
      return failure(res, 400, "Email and password are required!");
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return failure(res, 400, "User not found!");
    }

    const isMatch = await bcrypt.compare(normalizedPassword, user.password);
    if (!isMatch) {
      return failure(res, 400, "Invalid credentials!");
    }

    const token = buildToken(String(user._id));

    const payload = buildAuthPayload(token, sanitizeUser(user));

    return success(res, 200, "Login successful.", payload);
  } catch (_err) {
    return failure(res, 500, "Server error!");
  }
};

// LOGOUT
export const logout = async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return failure(res, 401, "No token provided!");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return failure(res, 401, "Invalid or expired token!");
    }

    if (await Blacklist.findOne({ token }).lean()) {
      return failure(res, 401, "Token is invalid (logged out)!");
    }

    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload;
    } catch {
      return failure(res, 401, "Invalid or expired token!");
    }

    const expiresAt = decoded.exp
      ? new Date(decoded.exp * 1000)
      : new Date(Date.now() + 7 * 86400000);

    await Blacklist.updateOne({ token }, { $set: { token, expiresAt } }, { upsert: true });

    return success(res, 200, "Logged out successfully.");
  } catch (_err) {
    return failure(res, 500, "Server error!");
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");

    if (!user) {
      return failure(res, 404, "User not found!");
    }

    const payload = sanitizeUser(user as any);

    return success(res, 200, "Profile fetched successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Unable to fetch profile!");
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: any) => {
  try {
    const updates = {
      name: String(req.body.name || "").trim(),
      bio: String(req.body.bio || "").trim(),
      favoriteCuisine: String(req.body.favoriteCuisine || "").trim(),
      yearOfStudy: String(req.body.yearOfStudy || "").trim(),
      avatarColor: String(req.body.avatarColor || "").trim() || "#2e7d61",
    };

    if (!updates.name || updates.name.length < 2) {
      return failure(res, 400, "Name must be at least 2 characters!");
    }

    const user = await User.findByIdAndUpdate(req.user?.userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return failure(res, 404, "User not found!");
    }

    const payload = sanitizeUser(user as any);

    return success(res, 200, "Profile updated successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Unable to update profile!");
  }
};
