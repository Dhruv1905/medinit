import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join role-based rooms
    socket.on("join-role", (role: string) => {
      socket.join(role);
      console.log(`${socket.id} joined room: ${role}`);
    });

    // Join personal room (for user-specific updates)
    socket.on("join-user", (userId: string) => {
      socket.join(`user-${userId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.IO not initialized");
  return io;
};

// Emit to specific roles
export const emitToRole = (role: string, event: string, data?: any) => {
  if (io) io.to(role).emit(event, data);
};

// Emit to specific user
export const emitToUser = (userId: string, event: string, data?: any) => {
  if (io) io.to(`user-${userId}`).emit(event, data);
};

// Emit to everyone
export const emitToAll = (event: string, data?: any) => {
  if (io) io.emit(event, data);
};