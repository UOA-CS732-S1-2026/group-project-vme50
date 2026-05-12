import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI;

    if (!MONGO_URI) {
      throw new Error("MONGO_URI is not defined");
    }

    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    if (mongoose.connection.readyState === 2) {
      await mongoose.connection.asPromise();
      return mongoose.connection;
    }

    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`MongoDB connected (${process.env.NODE_ENV || "development"})`);
    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection error:", err);

    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }

    throw err;
  }
};
