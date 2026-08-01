"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { useConversations, useMessages } from "@/hooks/use-conversations";
import { useChatSocket } from "@/hooks/use-chat-socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Headphones } from "lucide-react";
import { toast } from "sonner";
import { isSupportConversation } from "@/lib/chat/support";

function MessagesContent() {
  const searchParams = useSearchParams();
  const initialConversation = searchParams.get("conversation");
  const { currentUser, users, admins, listings } = useStore();
  const { conversations, loading, refresh } = useConversations(currentUser?.id);
  const [activeId, setActiveId] = useState<string | null>(initialConversation);
  const [draft, setDraft] = useState("");

  const activeConversation = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;
  const conversationId = activeConversation?.id ?? null;

  const { messages, loading: messagesLoading, appendMessage, markRead } = useMessages(conversationId);

  const { connected, typingUserId, sendMessage, emitTyping, emitStopTyping } = useChatSocket({
    userId: currentUser?.id,
    conversationId,
    onNewMessage: (message) => {
      appendMessage(message);
      if (message.senderId !== currentUser?.id) void markRead();
    },
  });

  const otherParty = useMemo(() => {
    if (!activeConversation || !currentUser) return null;
    if (isSupportConversation(activeConversation)) {
      return admins.find((a) => a.id === activeConversation.sellerId) ?? null;
    }
    const otherId =
      activeConversation.buyerId === currentUser.id
        ? activeConversation.sellerId
        : activeConversation.buyerId;
    return users.find((u) => u.id === otherId) ?? null;
  }, [activeConversation, currentUser, users, admins]);

  const listing = useMemo(
    () => listings.find((l) => l.id === activeConversation?.listingId),
    [listings, activeConversation?.listingId]
  );

  const typingName = typingUserId
    ? (admins.find((a) => a.id === typingUserId)?.name ??
        users.find((u) => u.id === typingUserId)?.name)?.split(" ")[0]
    : null;

  useEffect(() => {
    if (initialConversation) setActiveId(initialConversation);
  }, [initialConversation]);

  useEffect(() => {
    if (!loading && conversations.length > 0 && !initialConversation) {
      const support = conversations.find(isSupportConversation);
      setActiveId((current) => current ?? support?.id ?? conversations[0]?.id ?? null);
    }
  }, [loading, conversations, initialConversation]);

  useEffect(() => {
    if (conversationId) void markRead();
  }, [conversationId, markRead]);

  const handleSend = async () => {
    if (!draft.trim()) return;
    emitStopTyping();
    const result = await sendMessage(draft);
    if (!result.ok) {
      toast.error(result.error ?? "Failed to send message");
      return;
    }
    if (result.message) appendMessage(result.message);
    setDraft("");
    void refresh();
  };

  if (!currentUser) return null;

  return (
    <div>
      <div className="mb-6">
        <h1 className="display text-4xl">Messages</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Chat with support, buyers, and sellers
          {!connected && " · Connecting…"}
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <div className="rounded-3xl bg-background p-3 shadow-card">
          {loading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : conversations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">
              No conversations yet. Message a seller from a listing page.
            </p>
          ) : (
            conversations.map((c) => {
              const support = isSupportConversation(c);
              const otherId = c.buyerId === currentUser.id ? c.sellerId : c.buyerId;
              const other = support
                ? admins.find((a) => a.id === c.sellerId)
                : users.find((u) => u.id === otherId);
              const item = listings.find((l) => l.id === c.listingId);
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveId(c.id);
                    void markRead();
                  }}
                  className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                    c.id === (activeId ?? conversations[0]?.id) ? "bg-secondary" : "hover:bg-secondary/60"
                  }`}
                >
                  <div
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-xs font-bold ${
                      support
                        ? "bg-maple text-tuft"
                        : "bg-gradient-sun text-primary-foreground"
                    }`}
                  >
                    {support ? (
                      <Headphones className="h-4 w-4" />
                    ) : (
                      other?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2) ?? "?"
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-sm">
                      {support ? "BomboClyatt Support" : (other?.name ?? "User")}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {support ? "Platform support" : (item?.title ?? "Listing")}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="flex min-h-[480px] flex-col rounded-3xl bg-background shadow-card">
          {activeConversation ? (
            <>
              <div className="border-b border-border px-6 py-4">
                <p className="font-semibold">
                  {activeConversation && isSupportConversation(activeConversation)
                    ? "BomboClyatt Support"
                    : (otherParty?.name ?? "Conversation")}
                </p>
                {activeConversation && isSupportConversation(activeConversation) ? (
                  <p className="text-xs text-muted-foreground">Platform support · We typically reply within 24 hours</p>
                ) : listing ? (
                  <Link
                    href={`/listing/${listing.id}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Re: {listing.title}
                  </Link>
                ) : null}
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto p-6">
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages…</p>
                ) : messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello!</p>
                ) : (
                  messages.map((m) => {
                    const mine = m.senderId === currentUser.id;
                    const fromAdmin = admins.some((a) => a.id === m.senderId);
                    return (
                      <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                            mine
                              ? "bg-primary text-primary-foreground"
                              : fromAdmin
                                ? "bg-maple/10 border border-maple/20"
                                : "bg-secondary"
                          }`}
                        >
                          {m.body}
                          <p className={`mt-1 text-[10px] ${mine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                {typingName && (
                  <p className="text-xs text-muted-foreground">{typingName} is typing…</p>
                )}
              </div>

              <div className="border-t border-border p-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type a message…"
                    value={draft}
                    onChange={(e) => {
                      setDraft(e.target.value);
                      emitTyping();
                    }}
                    onBlur={emitStopTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        void handleSend();
                      }
                    }}
                  />
                  <Button onClick={() => void handleSend()} disabled={!draft.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center p-8 text-center text-muted-foreground">
              Select a conversation or start one from a listing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="p-8 text-muted-foreground">Loading messages…</p>}>
      <MessagesContent />
    </Suspense>
  );
}
