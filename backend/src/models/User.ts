import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  favoriteCuisine?: string;
  yearOfStudy?: string;
  avatarColor?: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: true,
  },

  bio: {
    type: String,
    trim: true,
    default: "",
    maxlength: 280,
  },

  favoriteCuisine: {
    type: String,
    trim: true,
    default: "",
    maxlength: 60,
  },

  yearOfStudy: {
    type: String,
    trim: true,
    default: "",
    maxlength: 40,
  },

  avatarColor: {
    type: String,
    trim: true,
    default: "#2e7d61",
  },
}, { timestamps: true });

export default mongoose.model<IUser>("User", userSchema);
