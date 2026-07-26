import { createServer } from "http";
import express from "express";
import cors from "cors";
import { Server, type Socket } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import Redis from "ioredis";
import { verifyChatToken } from "../src/lib/auth/jwt";
import { sanitizeMessageBody, isValidMessageBody } from "../src/lib/chat/sanitize";
import {
  createMessage,
  getUserConversations,
  isParticipant,
  countRecentMessages,
} from "../src/lib/chat/service";
import { checkSocketRateLimit, checkDbRateLimit } from "../src/lib/chat/rate-limit";
import type { Message } from "../src/lib/types";

const PORT = Number(process.env.SOCKET_PORT ?? 3001);
const CLIENT_ORIGIN = process.env.CLIENT_URL ?? "http://localhost:3000";

function conversationRoom(conversationId: string) {
  return `conversation:${conversationId}`;
}

async function joinUserConversationRooms(socket: Socket, userId: string) {
  const conversations = await getUserConversations(userId);
  for (const conversation of conversations) {
    socket.join(conversationRoom(conversation.id));
  }
  return conversations.map((c) => c.id);
}

async function createRedisAdapter() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("[chat] REDIS_URL not set — using in-memory adapter (single instance only)");
    return null;
  }

  const pubClient = new Redis(redisUrl);
  const subClient = pubClient.duplicate();
  pubClient.on("error", (err) => console.error("[chat] Redis pub error", err));
  subClient.on("error", (err) => console.error("[chat] Redis sub error", err));
  console.log("[chat] Redis adapter connected");
  return createAdapter(pubClient, subClient);
}

async function main() {
  const app = express();
  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.get("/health", (_req, res) => res.json({ ok: true }));

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
    transports: ["websocket", "polling"],
  });

  const adapter = await createRedisAdapter();
  if (adapter) io.adapter(adapter);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Unauthorized"));
    try {
      const payload = verifyChatToken(token);
      socket.data.userId = payload.userId;
      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = socket.data.userId as string;
    const joined = await joinUserConversationRooms(socket, userId);
    socket.emit("connected", { userId, conversationIds: joined });

    socket.on("join_conversation", async (payload: { conversationId?: string }, ack) => {
      const conversationId = payload?.conversationId;
      if (!conversationId) {
        ack?.({ ok: false, error: "conversationId required" });
        return;
      }
      const allowed = await isParticipant(conversationId, userId);
      if (!allowed) {
        ack?.({ ok: false, error: "Forbidden" });
        return;
      }
      socket.join(conversationRoom(conversationId));
      ack?.({ ok: true });
    });

    socket.on(
      "send_message",
      async (
        payload: { conversationId?: string; body?: string; attachmentUrl?: string | null },
        ack
      ) => {
        const conversationId = payload?.conversationId;
        const rawBody = payload?.body ?? "";

        if (!conversationId || !isValidMessageBody(rawBody)) {
          ack?.({ ok: false, error: "Invalid message" });
          return;
        }

        if (!checkSocketRateLimit(userId)) {
          ack?.({ ok: false, error: "Rate limit exceeded — slow down" });
          return;
        }

        const allowed = await isParticipant(conversationId, userId);
        if (!allowed) {
          ack?.({ ok: false, error: "Forbidden" });
          return;
        }

        const dbAllowed = await checkDbRateLimit(userId, countRecentMessages);
        if (!dbAllowed) {
          ack?.({ ok: false, error: "Rate limit exceeded — too many messages this minute" });
          return;
        }

        const body = sanitizeMessageBody(rawBody);
        let message: Message;
        try {
          message = await createMessage({
            conversationId,
            senderId: userId,
            body,
            attachmentUrl: payload.attachmentUrl ?? null,
          });
        } catch (error) {
          console.error("[chat] persist message failed", error);
          ack?.({ ok: false, error: "Failed to save message" });
          return;
        }

        io.to(conversationRoom(conversationId)).emit("new_message", { message });
        ack?.({ ok: true, message });
      }
    );

    socket.on("typing", async (payload: { conversationId?: string }) => {
      const conversationId = payload?.conversationId;
      if (!conversationId) return;
      const allowed = await isParticipant(conversationId, userId);
      if (!allowed) return;
      socket.to(conversationRoom(conversationId)).emit("typing", { conversationId, userId });
    });

    socket.on("stop_typing", async (payload: { conversationId?: string }) => {
      const conversationId = payload?.conversationId;
      if (!conversationId) return;
      const allowed = await isParticipant(conversationId, userId);
      if (!allowed) return;
      socket.to(conversationRoom(conversationId)).emit("stop_typing", { conversationId, userId });
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`[chat] Socket.IO server listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error("[chat] fatal", err);
  process.exit(1);
});
