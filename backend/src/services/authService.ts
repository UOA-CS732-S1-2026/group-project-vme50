import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Blacklist from "../models/Blacklist.js";
import { userRepository } from "../repositories/userRepository.js";

const generateToken = (userId: string) => {
  return jwt.sign({ userId, jti: new Date().getTime() }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
};

export const registerUser = async (data: { name: string; email: string; password: string }) => {
  const { name, email, password } = data;

  if (!email.endsWith("@aucklanduni.ac.nz")) {
    throw new Error("Only University of Auckland students can register");
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

  return generateToken(user._id.toString());
};

export const loginUser = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Invalid credentials");

  return generateToken(user._id.toString());
};

export const logoutUser = async (token: string) => {
  const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

  await Blacklist.create({
    token,
    expiresAt: new Date(decoded.exp * 1000),
  });

  return true;
};
