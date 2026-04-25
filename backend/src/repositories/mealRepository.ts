import MealSession from "../models/MealSession.js";

export const mealRepository = {
  async createMeal(data: any) {
    return await MealSession.create(data);
  },

  async findActiveMeals() {
    return await MealSession.find({ isActive: true })
      .populate("creator", "name email")
      .sort({ createdAt: -1 })
      .exec();
  },

  async findMealById(mealId: string) {
    return await MealSession.findById(mealId);
  },

  async saveMeal(session: any) {
    return await session.save();
  }
};