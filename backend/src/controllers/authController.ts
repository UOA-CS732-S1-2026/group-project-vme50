import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const buildToken = (userId: string) =>
  jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });

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

// REGISTER
export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedName = String(name || "").trim();

    if (!normalizedName || normalizedName.length < 2) {
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    if (!normalizedEmail.endsWith("@aucklanduni.ac.nz")) {
      return res.status(400).json({
        message: "Only University of Auckland students can register",
      });
    }

    if (String(password || "").length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = buildToken(String(user._id));

    res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// LOGIN
export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = buildToken(String(user._id));

    res.json({ token, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// LOGOUT (frontend handles it)
export const logout = (req: any, res: any) => {
  res.json({ message: "Logged out successfully" });
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: any) => {
  try {
    const user = await User.findById(req.user?.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: sanitizeUser(user as any) });
  } catch (err) {
    res.status(500).json({ message: "Unable to fetch profile", err });
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
      return res.status(400).json({ message: "Name must be at least 2 characters" });
    }

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: sanitizeUser(user as any),
    });
  } catch (err) {
    res.status(500).json({ message: "Unable to update profile", err });
  }
};
