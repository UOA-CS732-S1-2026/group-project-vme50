import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    await mongoose.connect(MONGO_URI);

    console.log(
      `MongoDB connected (${process.env.NODE_ENV || "development"})`
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};