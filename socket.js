import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: { origin: "*" },
  });

  io.use((socket, next) => {
    const userId = socket.handshake.auth.userId;

    if (!userId) return next(new Error("Unauthorized"));

    socket.userId = userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    // join room riêng
    socket.join(`user_${userId}`);

    console.log("User connected:", userId);

    socket.on("join_room", (roomId) => {
      socket.join(`room_${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected:", userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
    return io;
};