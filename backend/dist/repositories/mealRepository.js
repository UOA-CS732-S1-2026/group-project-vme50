import mongoose from "mongoose";
import MealSession from "../models/MealSession.js";
export const mealRepository = {
    async createMeal(data) {
        return await MealSession.create(data);
    },
    async findActiveMeals() {
        const meals = await MealSession.find({ isActive: true })
            .populate("creator", "name email")
            .lean()
            .sort({ createdAt: -1 });
        return meals.map((meal) => ({
            ...meal,
            participants: (meal.participants || []).map((p) => typeof p === "string" ? p : p._id.toString()),
        }));
    },
    async findMealById(mealId) {
        return await MealSession.findById(mealId);
    },
    async findMealByUser(userId) {
        return MealSession.findOne({
            participants: new mongoose.Types.ObjectId(userId),
        });
    },
    async deleteMeal(id) {
        return await MealSession.findByIdAndDelete(id);
    },
    async saveMeal(session) {
        return await session.save();
    },
};
//# sourceMappingURL=mealRepository.js.map