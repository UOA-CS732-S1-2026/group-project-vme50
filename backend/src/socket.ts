import type { Server as SocketIOServer } from "socket.io";

let io: SocketIOServer | null = null;

export const setSocketServer = (server: SocketIOServer) => {
  io = server;
};

export const emitMealSlotsUpdated = (mealId: string) => {
  io?.emit("mealSlotsUpdated", { mealId });
};

export const emitMealRemoved = (mealId: string) => {
  io?.emit("mealRemoved", { mealId });
};
