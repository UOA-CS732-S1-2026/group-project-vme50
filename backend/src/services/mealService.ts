import mongoose from "mongoose";
import MealSession from "../models/MealSession.js";

const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

export const createMeal = async (data: any, userId: string) => {
  const uid = toObjectId(userId);

  return await MealSession.create({
    ...data,
    creator: uid,
    participants: [uid],
  });
};

export const getMeals = async () => {
    return await MealSession.find({ isActive: true })
      .populate("creator", "name email")
      .sort({ createdAt: -1 })
      .exec();
  };

  export const joinMeal = async (mealId: string, userId: string) => {
    const session = await MealSession.findById(mealId);
  
    if (!session) throw new Error("NOT_FOUND");
    if (!session.isActive) throw new Error("CLOSED");
  
    const alreadyJoined = session.participants.some((p: any) =>
      typeof p.equals === "function"
        ? p.equals(userId)
        : String(p) === String(userId)
    );
  
    if (alreadyJoined) {
      throw new Error("ALREADY_JOINED");
    }
  
    session.participants.push(userId as any);
    await session.save();
  
    return session;
  };

  export const leaveMeal = async (mealId: string, userId: string) => {
    const session = await MealSession.findById(mealId);
  
    if (!session) throw new Error("NOT_FOUND");
  
    const index = session.participants.findIndex((p: any) =>
      typeof p.equals === "function"
        ? p.equals(userId)
        : String(p) === String(userId)
    );
  
    if (index === -1) throw new Error("NOT_IN_SESSION");
  
    session.participants.splice(index, 1);
  
    await session.save();
  
    return session;
  };