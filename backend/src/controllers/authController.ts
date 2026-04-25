import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import Blacklist from "../models/Blacklist.js";
import User from "../models/User.js";

// REGISTER
export const register = async (req: any, res: any) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith("@aucklanduni.ac.nz")) {
      return res.status(400).json({
        message: "Only University of Auckland students can register",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

// LOGIN
export const login = async (req: any, res: any) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error", err });
  }
};

export const logout = async (req: any, res: any) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Save token to blacklist until it expires
    await Blacklist.create({
      token,
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (err) {
    res.status(500).json({ message: "Logout failed" });
  }
};