import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio: string;
  favoriteCuisine: string;
  yearOfStudy: string;
  avatarColor: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: "",
      trim: true,
      maxlength: 240,
    },
    favoriteCuisine: {
      type: String,
      default: "",
      trim: true,
      maxlength: 80,
    },
    yearOfStudy: {
      type: String,
      default: "",
      trim: true,
      maxlength: 40,
    },
    avatarColor: {
      type: String,
      default: "#2e7d61",
      trim: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
