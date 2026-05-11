import mongoose from "mongoose";
import MealSession from "../models/MealSession.js";

export const mealRepository = {
  async createMeal(data: any) {
    return await MealSession.create(data);
  },

  async findActiveMeals() {
    const meals = await MealSession.find({ isActive: true })
      .populate("creator", "name email")
      .lean()
      .sort({ createdAt: -1 });

    return meals.map((meal) => ({
      ...meal,
      participants: (meal.participants || []).map((p: any) =>
        typeof p === "string" ? p : p._id.toString(),
      ),
    }));
  },

  async findMealById(mealId: string) {
    return await MealSession.findById(mealId);
  },

  async findMealDetailsById(mealId: string) {
    return await MealSession.findById(mealId)
      .populate("creator", "name email avatarColor")
      .populate("participants", "name email avatarColor")
      .lean();
  },

  async findMealByUser(userId: string) {
    return MealSession.findOne({
      isActive: true,
      participants: new mongoose.Types.ObjectId(userId),
    });
  },

  async findMealsByCreator(userId: string) {
    return await MealSession.find({
      creator: new mongoose.Types.ObjectId(userId),
    })
      .populate("creator", "name email avatarColor")
      .populate("participants", "name email avatarColor")
      .lean()
      .sort({ createdAt: -1 });
  },

  async findMealsJoinedByUser(userId: string) {
    return await MealSession.find({
      participants: new mongoose.Types.ObjectId(userId),
    })
      .populate("creator", "name email avatarColor")
      .populate("participants", "name email avatarColor")
      .lean()
      .sort({ createdAt: -1 });
  },

  async deleteMeal(id: string) {
    return await MealSession.findByIdAndDelete(id);
  },

  async saveMeal(session: any) {
    return await session.save();
  },
};
