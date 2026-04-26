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

export const joinMealSession = async (req: any, res: any) => {
  try {
    const userId = req.user.userId;
    const sessionId = req.params.id;

    const session = await MealSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.isActive) {
      return res.status(400).json({ message: "Session is closed" });
    }

    if (session.participants.includes(userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    if (session.participants.length >= session.slots) {
      return res.status(400).json({ message: "Session full" });
    }

    const existing = await MealSession.findOne({
      participants: userId,
      isActive: true,
    });

    if (existing) {
      return res.status(400).json({
        message: "You are already in an active session",
      });
    }

    session.participants.push(userId);
    await session.save();

    res.json({ message: "Joined session", session });
  } catch (err) {
    res.status(500).json({ message: "Error joining session", err });
  }
};

export const leaveMealSession = async (req: any, res: any) => {
    try {
      const userId = req.user.userId;
      const sessionId = req.params.id;
  
      const session = await MealSession.findById(sessionId);
  
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
  
      const index = session.participants.indexOf(userId);
  
      if (index === -1) {
        return res.status(400).json({ message: "Not in session" });
      }
  
      session.participants.splice(index, 1);
  
      await session.save();
  
      res.json({ message: "Left session", session });
    } catch (err) {
      res.status(500).json({ message: "Error leaving session", err });
    }
  };