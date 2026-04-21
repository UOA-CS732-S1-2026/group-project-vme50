import MealSession from "../models/MealSession.js";

export const createMealSession = async (req: any, res: any) => {
  try {
    const { title, description, location, time, slots } = req.body;

    const session = await MealSession.create({
      title,
      description,
      location,
      time,
      slots,
      creator: req.user.userId,
      participants: [req.user.userId],
    });

    res.status(201).json({
      message: "Meal session created",
      session,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", err });
  }
};