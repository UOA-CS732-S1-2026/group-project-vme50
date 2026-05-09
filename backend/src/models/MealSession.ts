import mongoose from "mongoose";

const mealSessionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    location: {
      address: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      lat: {
        type: Number,
        required: true,
      },

      lng: {
        type: Number,
        required: true,
      },
    },

    time: {
      type: Date,
      required: true,
      index: true,
    },

    slots: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 2,
    },

    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
      index: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("MealSession", mealSessionSchema);
