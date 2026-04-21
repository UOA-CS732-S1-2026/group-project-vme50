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

export const getAllMeals = async (req: any, res: any) => {
    try {
      const meals = await MealSession.find({ isActive: true })
        .populate("creator", "name email")
        .sort({ createdAt: -1 });
  
      res.json(meals);
    } catch (err) {
      res.status(500).json({ message: "Error fetching meals", err });
    }
  };