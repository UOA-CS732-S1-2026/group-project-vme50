import MealSession from "../models/MealSession.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

const buildSessionQuery = () =>
  MealSession.find()
    .populate("creator", "name email favoriteCuisine avatarColor")
    .populate("participants", "name email avatarColor");

const normalizeSession = (session: any) => ({
  ...session.toObject(),
  id: String(session._id),
});

const isFutureSession = (time: Date | string) => new Date(time).getTime() > Date.now();

export const createMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const { title, description, location, time, slots } = req.body;
    const normalizedTitle = String(title || "").trim();
    const normalizedDescription = String(description || "").trim();
    const normalizedLocation = String(location || "").trim();
    const normalizedSlots = Number(slots);
    const sessionTime = new Date(time);

    if (!normalizedTitle || normalizedTitle.length < 3) {
      return res.status(400).json({ message: "Title must be at least 3 characters" });
    }

    if (!normalizedDescription || normalizedDescription.length < 10) {
      return res.status(400).json({ message: "Description must be at least 10 characters" });
    }

    if (!normalizedLocation) {
      return res.status(400).json({ message: "Location is required" });
    }

    if (Number.isNaN(sessionTime.getTime()) || !isFutureSession(sessionTime)) {
      return res.status(400).json({ message: "Session time must be in the future" });
    }

    if (!Number.isInteger(normalizedSlots) || normalizedSlots < 2 || normalizedSlots > 12) {
      return res.status(400).json({ message: "Slots must be between 2 and 12" });
    }

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const existing = await MealSession.findOne({
      participants: userId,
      isActive: true,
      time: { $gt: new Date() },
    } as any);

    if (existing) {
      return res.status(400).json({
        message: "You are already in an active session",
      });
    }

    const session = await MealSession.create({
      title: normalizedTitle,
      description: normalizedDescription,
      location: normalizedLocation,
      time: sessionTime,
      slots: normalizedSlots,
      creator: userId,
      participants: [userId],
    });

    const populatedSession = await buildSessionQuery().findById(session._id);

    res.status(201).json({
      message: "Meal session created",
      session: populatedSession ? normalizeSession(populatedSession) : session,
    });
  } catch (err) {
    res.status(500).json({ message: "Error", err });
  }
};

export const getAllMeals = async (req: any, res: any) => {
  try {
    await MealSession.updateMany(
      { isActive: true, time: { $lte: new Date() } },
      { isActive: false }
    );

    const meals = await buildSessionQuery()
      .find({ isActive: true, time: { $gt: new Date() } })
      .sort({ time: 1 });

    res.json(meals.map(normalizeSession));
  } catch (err) {
    res.status(500).json({ message: "Error fetching meals", err });
  }
};

export const getMealById = async (req: any, res: any) => {
  try {
    const session = await buildSessionQuery().findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json({ session: normalizeSession(session) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching session details", err });
  }
};

export const getMyHostedMeals = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await buildSessionQuery()
      .find({ creator: userId } as any)
      .sort({ createdAt: -1 });

    res.json({ sessions: sessions.map(normalizeSession) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching hosted sessions", err });
  }
};

export const getMyJoinedMeals = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await buildSessionQuery()
      .find({ participants: userId } as any)
      .sort({ time: -1 });

    res.json({ sessions: sessions.map(normalizeSession) });
  } catch (err) {
    res.status(500).json({ message: "Error fetching joined sessions", err });
  }
};

export const joinMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await MealSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (!session.isActive) {
      return res.status(400).json({ message: "Session is closed" });
    }

    if (!isFutureSession(session.time)) {
      session.isActive = false;
      await session.save();
      return res.status(400).json({ message: "Session has already started" });
    }

    if ((session.participants as any[]).includes(userId)) {
      return res.status(400).json({ message: "Already joined" });
    }

    if (session.participants.length >= session.slots) {
      return res.status(400).json({ message: "Session full" });
    }

    const existing = await MealSession.findOne({
      participants: userId,
      isActive: true,
    } as any);

    if (existing) {
      return res.status(400).json({
        message: "You are already in an active session",
      });
    }

    (session.participants as any[]).push(userId);
    await session.save();

    const populatedSession = await buildSessionQuery().findById(session._id);

    res.json({
      message: "Joined session",
      session: populatedSession ? normalizeSession(populatedSession) : session,
    });
  } catch (err) {
    res.status(500).json({ message: "Error joining session", err });
  }
};

export const leaveMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await MealSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    const index = (session.participants as any[]).indexOf(userId);

    if (index === -1) {
      return res.status(400).json({ message: "Not in session" });
    }

    session.participants.splice(index, 1);

    if (String(session.creator) === userId && session.participants.length > 0) {
      session.creator = session.participants[0] as any;
    }

    if (session.participants.length === 0) {
      session.isActive = false;
    }

    await session.save();

    const populatedSession = await buildSessionQuery().findById(session._id);

    res.json({
      message: session.isActive ? "Left session" : "Session closed after everyone left",
      session: populatedSession ? normalizeSession(populatedSession) : session,
    });
  } catch (err) {
    res.status(500).json({ message: "Error leaving session", err });
  }
};

export const closeMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const session = await MealSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (String(session.creator) !== req.user?.userId) {
      return res.status(403).json({ message: "Only the host can close this session" });
    }

    session.isActive = false;
    await session.save();

    const populatedSession = await buildSessionQuery().findById(session._id);

    res.json({
      message: "Session closed successfully",
      session: populatedSession ? normalizeSession(populatedSession) : session,
    });
  } catch (err) {
    res.status(500).json({ message: "Error closing session", err });
  }
};
