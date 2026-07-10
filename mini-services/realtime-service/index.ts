/**
 * LootLoom Real-time Service — Socket.io mini-service.
 *
 * Handles live updates for:
 * - wallet.updated (coin balance changes)
 * - transaction.created (new transactions)
 * - notification.created (new notifications)
 * - redeem.updated (redeem status changes)
 *
 * Users join their own room: user:{userId}
 * The Next.js API routes emit events to this service via HTTP emit.
 *
 * Frontend connects via: io("/?XTransformPort=3003")
 */
import { createServer } from "http";
import { Server } from "socket.io";

const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: { origin: "*", methods: ["GET", "POST"] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Track connected users: socketId -> userId
const connectedUsers = new Map<string, string>();

io.on("connection", (socket) => {
  console.log(`[realtime] connected: ${socket.id}`);

  // User authenticates and joins their personal room
  socket.on("auth", (data: { userId?: string }) => {
    if (data?.userId) {
      connectedUsers.set(socket.id, data.userId);
      socket.join(`user:${data.userId}`);
      console.log(`[realtime] user ${data.userId} joined room`);
    }
  });

  // Internal: allow API routes to emit events to a specific user
  socket.on("server:emit", (data: { userId: string; event: string; payload: unknown }) => {
    // Only accept from internal connections (localhost)
    const isLocal = socket.handshake.address === "127.0.0.1" || socket.handshake.address === "::1";
    if (isLocal && data.userId && data.event) {
      io.to(`user:${data.userId}`).emit(data.event, data.payload);
    }
  });

  socket.on("disconnect", () => {
    const userId = connectedUsers.get(socket.id);
    if (userId) {
      connectedUsers.delete(socket.id);
      console.log(`[realtime] user ${userId} disconnected`);
    }
  });

  socket.on("error", (error) => {
    console.error(`[realtime] socket error (${socket.id}):`, error);
  });
});

const PORT = 3003;
httpServer.listen(PORT, () => {
  console.log(`[realtime] LootLoom real-time service running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  httpServer.close(() => process.exit(0));
});
process.on("SIGINT", () => {
  httpServer.close(() => process.exit(0));
});
