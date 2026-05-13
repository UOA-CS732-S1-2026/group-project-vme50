import mongoose from "mongoose";
import MealSession from "../models/MealSession.js";

export const mealRepository = {
  async createMeal(data: any) {
    const meal = await MealSession.create(data);
    const populatedMeal = await meal.populate("creator", "name email");

    return populatedMeal;
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

  async findMealByUser(userId: string) {
    return MealSession.findOne({
      participants: new mongoose.Types.ObjectId(userId),
    });
  },

  async deleteMeal(id: string) {
    return await MealSession.findByIdAndDelete(id);
  },

  async saveMeal(session: any) {
    return await session.save();
  },
};
