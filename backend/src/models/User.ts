import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  course?: string;
  interests?: string[];
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
    default: "",
    maxlength: 300,
    trim: true,
  },

  course: {
    type: String,
    default: "",
    maxlength: 100,
    trim: true,
  },

  interests: {
    type: [String],
    default: [],
  },

  avatarColor: {
    type: String,
    default: "#10b981",
  },
});

export default mongoose.model<IUser>("User", userSchema);
