import { promises as fs } from "fs";
import path from "path";
import type { Conversation, Message } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), ".data");
const CHAT_FILE = path.join(DATA_DIR, "chat.json");

type ChatData = {
  conversations: Conversation[];
  messages: Message[];
};

async function ensureDataFile(): Promise<ChatData> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const raw = await fs.readFile(CHAT_FILE, "utf-8");
    return JSON.parse(raw) as ChatData;
  } catch {
    const empty: ChatData = { conversations: [], messages: [] };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CHAT_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
}

async function save(data: ChatData): Promise<void> {
  await fs.writeFile(CHAT_FILE, JSON.stringify(data, null, 2));
}

function conversationKey(buyerId: string, sellerId: string, listingId: string): string {
  return `${buyerId}:${sellerId}:${listingId}`;
}

export async function localFindConversationByParticipants(
  buyerId: string,
  sellerId: string,
  listingId: string
): Promise<Conversation | null> {
  const data = await ensureDataFile();
  return (
    data.conversations.find(
      (c) => c.buyerId === buyerId && c.sellerId === sellerId && c.listingId === listingId
    ) ?? null
  );
}

export async function localCreateConversation(input: {
  type?: "listing" | "support";
  buyerId: string;
  sellerId: string;
  listingId: string;
}): Promise<Conversation> {
  const data = await ensureDataFile();
  const existing = data.conversations.find(
    (c) =>
      c.buyerId === input.buyerId &&
      c.sellerId === input.sellerId &&
      c.listingId === input.listingId
  );
  if (existing) return existing;

  const type = input.type ?? (input.listingId === "support" ? "support" : "listing");
  const now = new Date().toISOString();
  const conversation: Conversation = {
    id:
      type === "support"
        ? `conv-support-${input.buyerId}`
        : `conv-${Date.now()}-${conversationKey(input.buyerId, input.sellerId, input.listingId).slice(0, 8)}`,
    type,
    buyerId: input.buyerId,
    sellerId: input.sellerId,
    listingId: input.listingId,
    createdAt: now,
    lastMessageAt: now,
  };
  data.conversations.push(conversation);
  await save(data);
  return conversation;
}

export async function localGetUserConversations(userId: string): Promise<Conversation[]> {
  const data = await ensureDataFile();
  return data.conversations
    .filter((c) => c.buyerId === userId || c.sellerId === userId)
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function localGetConversation(id: string): Promise<Conversation | null> {
  const data = await ensureDataFile();
  return data.conversations.find((c) => c.id === id) ?? null;
}

export async function localIsConversationParticipant(
  conversationId: string,
  userId: string
): Promise<boolean> {
  const conversation = await localGetConversation(conversationId);
  if (!conversation) return false;
  if (conversation.type === "support" || conversation.listingId === "support") {
    return conversation.buyerId === userId;
  }
  return conversation.buyerId === userId || conversation.sellerId === userId;
}

export async function localCreateMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl?: string | null;
}): Promise<Message> {
  const data = await ensureDataFile();
  const conversation = data.conversations.find((c) => c.id === input.conversationId);
  if (!conversation) throw new Error("Conversation not found");

  const now = new Date().toISOString();
  const message: Message = {
    id: `msg-${Date.now()}`,
    conversationId: input.conversationId,
    senderId: input.senderId,
    body: input.body,
    attachmentUrl: input.attachmentUrl ?? null,
    readAt: null,
    createdAt: now,
  };
  data.messages.push(message);
  conversation.lastMessageAt = now;
  await save(data);
  return message;
}

export async function localGetMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {}
): Promise<Message[]> {
  const data = await ensureDataFile();
  const limit = options.limit ?? 50;
  let messages = data.messages
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (options.before) {
    messages = messages.filter((m) => m.createdAt < options.before!);
  }

  return messages.slice(0, limit).reverse();
}

export async function localMarkMessagesRead(
  conversationId: string,
  readerId: string
): Promise<number> {
  const data = await ensureDataFile();
  const conversation = data.conversations.find((c) => c.id === conversationId);
  if (!conversation) return 0;
  if (conversation.buyerId !== readerId && conversation.sellerId !== readerId) return 0;

  const now = new Date().toISOString();
  let count = 0;
  for (const message of data.messages) {
    if (
      message.conversationId === conversationId &&
      message.senderId !== readerId &&
      !message.readAt
    ) {
      message.readAt = now;
      count++;
    }
  }
  if (count > 0) await save(data);
  return count;
}

export async function localCountRecentMessages(
  senderId: string,
  windowMs: number
): Promise<number> {
  const data = await ensureDataFile();
  const cutoff = Date.now() - windowMs;
  return data.messages.filter(
    (m) => m.senderId === senderId && new Date(m.createdAt).getTime() > cutoff
  ).length;
}
