import mongoose, { Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema<IUser>({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: String,
});

export default mongoose.model<IUser>("User", userSchema);