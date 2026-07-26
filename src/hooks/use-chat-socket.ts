"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { getChatToken, fetchChatToken } from "@/lib/chat/client-auth";
import type { Message } from "@/lib/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001";

type UseChatSocketOptions = {
  userId: string | undefined;
  conversationId: string | null;
  onNewMessage?: (message: Message) => void;
};

export function useChatSocket({ userId, conversationId, onNewMessage }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [typingUserId, setTypingUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    void (async () => {
      let token = getChatToken();
      if (!token) token = await fetchChatToken(userId);
      if (!token || cancelled) return;

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket", "polling"],
        reconnection: true,
      });

      socketRef.current = socket;

      socket.on("connect", () => setConnected(true));
      socket.on("disconnect", () => setConnected(false));

      socket.on("new_message", (payload: { message: Message }) => {
        onNewMessage?.(payload.message);
      });

      socket.on("typing", (payload: { conversationId: string; userId: string }) => {
        if (payload.conversationId !== conversationId) return;
        setTypingUserId(payload.userId);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setTypingUserId(null), 3000);
      });

      socket.on("stop_typing", (payload: { conversationId: string }) => {
        if (payload.conversationId === conversationId) setTypingUserId(null);
      });
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !conversationId || !connected) return;

    socket.emit("join_conversation", { conversationId }, () => {});
  }, [conversationId, connected]);

  const sendMessage = useCallback(
    (body: string): Promise<{ ok: boolean; error?: string; message?: Message }> => {
      return new Promise((resolve) => {
        const socket = socketRef.current;
        if (!socket || !conversationId) {
          resolve({ ok: false, error: "Not connected" });
          return;
        }
        socket.emit("send_message", { conversationId, body }, (response: {
          ok: boolean;
          error?: string;
          message?: Message;
        }) => {
          resolve(response ?? { ok: false, error: "No response" });
        });
      });
    },
    [conversationId]
  );

  const emitTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("typing", { conversationId });
  }, [conversationId]);

  const emitStopTyping = useCallback(() => {
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("stop_typing", { conversationId });
  }, [conversationId]);

  return {
    connected,
    typingUserId,
    sendMessage,
    emitTyping,
    emitStopTyping,
  };
}
