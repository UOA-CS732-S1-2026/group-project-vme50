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
