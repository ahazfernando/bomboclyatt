"use client";

import { useCallback, useEffect, useState } from "react";
import { chatAuthHeaders, fetchChatToken } from "@/lib/chat/client-auth";
import type { Conversation, Message } from "@/lib/types";

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    await fetchChatToken(userId);
    try {
      const res = await fetch("/api/conversations", { headers: chatAuthHeaders() });
      if (res.ok) {
        const data = (await res.json()) as { conversations: Conversation[] };
        setConversations(data.conversations);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { conversations, loading, refresh };
}

export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!conversationId) {
      setMessages([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        headers: chatAuthHeaders(),
      });
      if (res.ok) {
        const data = (await res.json()) as { messages: Message[] };
        setMessages(data.messages);
      }
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const appendMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const markRead = useCallback(async () => {
    if (!conversationId) return;
    await fetch(`/api/conversations/${conversationId}/read`, {
      method: "PATCH",
      headers: chatAuthHeaders(),
    });
  }, [conversationId]);

  return { messages, loading, refresh, appendMessage, markRead };
}

export async function startConversation(listingId: string, sellerId: string): Promise<Conversation | null> {
  const res = await fetch("/api/conversations", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...chatAuthHeaders() },
    body: JSON.stringify({ listingId, sellerId }),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { conversation: Conversation };
  return data.conversation;
}
