import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";
import { userRepository } from "../repositories/userRepository.js";

/* ================= HELPER FUNCTIONS ================= */
const generateToken = (userId: string) => {
  return jwt.sign({ userId, jti: new Date().getTime() }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

const sanitizeUser = (user: any) => ({
  id: user._id?.toString?.() ?? user._id,
  name: user.name,
  email: user.email,
  bio: user.bio || "",
  favoriteCuisine: user.favoriteCuisine || "",
  yearOfStudy: user.yearOfStudy || "",
  avatarColor: user.avatarColor || "#2e7d61",
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

/* ================= REGISTER ================= */
export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;

  if (!email.endsWith("@aucklanduni.ac.nz")) {
    throw new Error("Only University of Auckland students can register");
  }

  const upiRegex = /^[A-Za-z]{4}\d{3}@aucklanduni\.ac\.nz$/;

  if (!upiRegex.test(email)) {
    throw new Error("Invalid UPI format!");
  }

  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await userRepository.createUser({
    name,
    email,
    password: hashedPassword,
  });

  const token = generateToken(user._id.toString());

  return {
    success: true,
    message: "User registered successfully",
    data: {
      token,
      user: sanitizeUser(user),
    },
  };
};

/* ================= LOGIN ================= */
export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  const token = generateToken(user._id.toString());

  return {
    success: true,
    message: "Login successful",
    data: {
      token,
      user: sanitizeUser(user),
    },
  };
};

/* ================= LOGOUT ================= */
export const logoutUser = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

  await Blacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return {
    success: true,
    message: "Logged out successfully",
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("User not found");

  return {
    success: true,
    data: sanitizeUser(user),
  };
};

export const updateCurrentUser = async (
  userId: string,
  data: {
    name?: string;
    bio?: string;
    favoriteCuisine?: string;
    yearOfStudy?: string;
    avatarColor?: string;
  },
) => {
  const updates = Object.fromEntries(
    Object.entries({
      name: data.name?.trim(),
      bio: data.bio?.trim(),
      favoriteCuisine: data.favoriteCuisine?.trim(),
      yearOfStudy: data.yearOfStudy?.trim(),
      avatarColor: data.avatarColor?.trim(),
    }).filter(([, value]) => value !== undefined),
  ) as {
    name?: string;
    bio?: string;
    favoriteCuisine?: string;
    yearOfStudy?: string;
    avatarColor?: string;
  };

  const user = await userRepository.updateUser(userId, updates);

  if (!user) throw new Error("User not found");

  return {
    success: true,
    message: "Profile updated successfully",
    data: sanitizeUser(user),
  };
};
