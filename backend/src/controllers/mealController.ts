import MealSession from "../models/MealSession.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { emitMealRemoved, emitMealSlotsUpdated } from "../socket.js";

const buildSessionQuery = () =>
  MealSession.find()
    .populate("creator", "name email favoriteCuisine avatarColor")
    .populate("participants", "name email avatarColor");

const normalizeSession = (session: any) => ({
  ...session.toObject(),
  id: String(session._id),
});

const normalizeLocationInput = (location: unknown) => {
  if (typeof location === "string") {
    return location.trim();
  }

  if (location && typeof location === "object") {
    const { address, lat, lng } = location as {
      address?: unknown;
      lat?: unknown;
      lng?: unknown;
    };

    const normalizedAddress = typeof address === "string" ? address.trim() : "";

    if (!normalizedAddress) {
      return "";
    }

    return {
      address: normalizedAddress,
      ...(typeof lat === "number" ? { lat } : {}),
      ...(typeof lng === "number" ? { lng } : {}),
    };
  }

  return "";
};

const isFutureSession = (time: Date | string) => new Date(time).getTime() > Date.now();

const failure = (res: any, status: number, message: string) =>
  res.status(status).json({ success: false, message });

const success = (res: any, status: number, message: string, data?: unknown) =>
  res.status(status).json({
    success: true,
    message,
    ...(data !== undefined ? { data } : {}),
    ...(data && typeof data === "object" && !Array.isArray(data) ? { session: data } : {}),
    ...(Array.isArray(data) ? { sessions: data } : {}),
  });

export const createMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const { title, description, location, time, slots } = req.body;
    const normalizedTitle = String(title || "").trim();
    const normalizedDescription = String(description || "").trim();
    const normalizedLocation = normalizeLocationInput(location);
    const normalizedSlots = Number(slots);
    const sessionTime = new Date(time);

    if (!normalizedTitle || normalizedTitle.length < 3) {
      return failure(res, 400, "Error creating meal!");
    }

    if (!normalizedDescription || normalizedDescription.length < 5) {
      return failure(res, 400, "Error creating meal!");
    }

    if (!normalizedLocation) {
      return failure(res, 400, "Error creating meal!");
    }

    if (Number.isNaN(sessionTime.getTime()) || !isFutureSession(sessionTime)) {
      return failure(res, 400, "Error creating meal!");
    }

    if (!Number.isInteger(normalizedSlots) || normalizedSlots < 2 || normalizedSlots > 12) {
      return failure(res, 400, "Error creating meal!");
    }

    if (!userId) {
      return failure(res, 401, "Unauthorized!");
    }

    const existing = await MealSession.findOne({
      participants: userId,
      isActive: true,
      time: { $gt: new Date() },
    } as any);

    if (existing) {
      return failure(res, 400, "Error creating meal!");
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

    const payload = populatedSession
      ? normalizeSession(populatedSession)
      : normalizeSession(session);

    success(res, 201, "Meal session created.", payload);

    emitMealSlotsUpdated(String(session._id));
  } catch (_err) {
    failure(res, 500, "Error creating meal!");
  }
};

export const getAllMeals = async (req: any, res: any) => {
  try {
    await MealSession.updateMany(
      { isActive: true, time: { $lte: new Date() } },
      { isActive: false },
    );

    const meals = await buildSessionQuery()
      .find({ isActive: true, time: { $gt: new Date() } })
      .sort({ time: 1 });

    const payload = meals.map(normalizeSession);

    return success(res, 200, "Meals fetched successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Error fetching meals!");
  }
};

export const getMealById = async (req: any, res: any) => {
  try {
    const session = await buildSessionQuery().findById(req.params.id);

    if (!session) {
      return failure(res, 404, "Session not found!");
    }

    const payload = normalizeSession(session);

    return success(res, 200, "Session fetched successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Error fetching session details!");
  }
};

export const getMyHostedMeals = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return failure(res, 401, "Unauthorized!");
    }

    const sessions = await buildSessionQuery()
      .find({ creator: userId } as any)
      .sort({ createdAt: -1 });

    const payload = sessions.map(normalizeSession);

    return success(res, 200, "Hosted sessions fetched successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Error fetching hosted sessions!");
  }
};

export const getMyJoinedMeals = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return failure(res, 401, "Unauthorized!");
    }

    const sessions = await buildSessionQuery()
      .find({ participants: userId } as any)
      .sort({ time: -1 });

    const payload = sessions.map(normalizeSession);

    return success(res, 200, "Joined sessions fetched successfully.", payload);
  } catch (_err) {
    return failure(res, 500, "Error fetching joined sessions!");
  }
};

export const joinMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      return failure(res, 401, "Unauthorized!");
    }

    if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      return failure(res, 400, "Cannot join session!");
    }

    const session = await MealSession.findById(sessionId);

    if (!session) {
      return failure(res, 404, "Session not found!");
    }

    if (!session.isActive) {
      return failure(res, 400, "Cannot join session!");
    }

    if (!isFutureSession(session.time)) {
      session.isActive = false;
      await session.save();
      return failure(res, 400, "Cannot join session!");
    }

    if ((session.participants as any[]).includes(userId)) {
      return failure(res, 400, "Already joined!");
    }

    if (session.participants.length >= session.slots) {
      return failure(res, 400, "Cannot join session!");
    }

    const existing = await MealSession.findOne({
      participants: userId,
      isActive: true,
    } as any);

    if (existing) {
      return failure(res, 400, "Cannot join session!");
    }

    (session.participants as any[]).push(userId);
    await session.save();

    const populatedSession = await buildSessionQuery().findById(session._id);

    const payload = populatedSession
      ? normalizeSession(populatedSession)
      : normalizeSession(session);

    success(res, 200, "Joined session.", payload);

    emitMealSlotsUpdated(String(session._id));
  } catch (_err) {
    failure(res, 500, "Cannot join session!");
  }
};

export const leaveMealSession = async (req: AuthenticatedRequest, res: any) => {
  try {
    const userId = req.user?.userId;
    const sessionId = req.params.id;

    if (!userId) {
      return failure(res, 401, "Unauthorized!");
    }

    if (!sessionId || !sessionId.match(/^[0-9a-fA-F]{24}$/)) {
      return failure(res, 400, "Error leaving session!");
    }

    const session = await MealSession.findById(sessionId);

    if (!session) {
      return failure(res, 400, "Meal session not found!");
    }

    const index = (session.participants as any[]).indexOf(userId);

    if (index === -1) {
      return failure(res, 400, "Not in session!");
    }

    session.participants.splice(index, 1);

    if (String(session.creator) === userId && session.participants.length > 0) {
      session.creator = session.participants[0] as any;
    }

    if (session.participants.length === 0) {
      await MealSession.findByIdAndDelete(sessionId);

      emitMealRemoved(String(session._id));

      return success(res, 200, "Left session.", normalizeSession(session));
    }

    await session.save();

    const populatedSession = await buildSessionQuery().findById(session._id);

    const payload = populatedSession
      ? normalizeSession(populatedSession)
      : normalizeSession(session);

    success(res, 200, "Left session.", payload);

    emitMealSlotsUpdated(String(session._id));
  } catch (_err) {
    failure(res, 500, "Error leaving session!");
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

    const payload = populatedSession
      ? normalizeSession(populatedSession)
      : normalizeSession(session);

    res.json({
      message: "Session closed successfully",
      session: payload,
      data: payload,
    });

    emitMealRemoved(String(session._id));
  } catch (err) {
    res.status(500).json({ message: "Error closing session", err });
  }
};
