import mongoose from "mongoose";
import { mealRepository } from "../repositories/mealRepository.js";
const toObjectId = (id) => new mongoose.Types.ObjectId(id);
export const createMeal = async (data, userId) => {
    const mealTime = new Date(data.time);
    if (mealTime < new Date()) {
        throw new Error("INVALID_TIME");
    }
    const uid = toObjectId(userId);
    return await mealRepository.createMeal({
        title: data.title,
        description: data.description || "",
        location: {
            address: data.location.address,
            lat: data.location.lat,
            lng: data.location.lng,
        },
        time: mealTime,
        slots: data.slots ?? data.maxParticipants,
        creator: uid,
        participants: [uid],
    });
};
export const getMeals = async () => {
    return await mealRepository.findActiveMeals();
};
export const joinMeal = async (mealId, userId) => {
    const session = await mealRepository.findMealById(mealId);
    if (!session)
        throw new Error("NOT_FOUND");
    if (!session.isActive)
        throw new Error("CLOSED");
    const alreadyJoined = session.participants.some((p) => typeof p.equals === "function" ? p.equals(userId) : String(p) === String(userId));
    if (alreadyJoined)
        throw new Error("ALREADY_JOINED");
    session.participants.push(userId);
    await mealRepository.saveMeal(session);
    return session;
};
export const leaveMeal = async (mealId, userId) => {
    const session = await mealRepository.findMealById(mealId);
    if (!session)
        throw new Error("NOT_FOUND");
    const index = session.participants.findIndex((p) => typeof p.equals === "function" ? p.equals(userId) : String(p) === String(userId));
    if (index === -1)
        throw new Error("NOT_IN_SESSION");
    session.participants.splice(index, 1);
    await mealRepository.saveMeal(session);
    if (session.participants.length === 0) {
        await mealRepository.deleteMeal(mealId);
    }
    return session;
};
//# sourceMappingURL=mealService.js.map