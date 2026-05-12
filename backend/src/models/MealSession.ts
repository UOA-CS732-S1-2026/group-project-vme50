import mongoose from "mongoose";

const mealSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      validate: {
        validator: (value: unknown) => {
          if (typeof value === "string") {
            return value.trim().length > 0;
          }

          if (value && typeof value === "object") {
            const address = (value as { address?: unknown }).address;
            return typeof address === "string" && address.trim().length > 0;
          }

          return false;
        },
        message: "Location is required",
      },
    },

    time: {
      type: Date,
      required: true,
    },

    slots: {
      type: Number,
      required: true,
      default: 2,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("MealSession", mealSessionSchema);
