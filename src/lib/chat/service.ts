import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getServerFirestore } from "@/lib/firebase/server";
import {
  countRecentMessagesBySender,
  createConversation as firestoreCreateConversation,
  createMessage as firestoreCreateMessage,
  findConversationByParticipants,
  getConversation as firestoreGetConversation,
  getConversationMessages,
  getUserConversations as firestoreGetUserConversations,
  markConversationMessagesRead,
} from "@/lib/firebase/db";
import {
  localCountRecentMessages,
  localCreateConversation,
  localCreateMessage,
  localFindConversationByParticipants,
  localGetConversation,
  localGetMessages,
  localGetUserConversations,
  localIsConversationParticipant,
  localMarkMessagesRead,
} from "@/lib/chat/local-store";
import type { Conversation, Message } from "@/lib/types";
import {
  DEFAULT_SUPPORT_ADMIN_ID,
  SUPPORT_LISTING_ID,
  SUPPORT_WELCOME_MESSAGE,
  sortConversations,
} from "@/lib/chat/support";

export function isConversationParticipant(conversation: Conversation, userId: string): boolean {
  if (conversation.type === "support" || conversation.listingId === SUPPORT_LISTING_ID) {
    return conversation.buyerId === userId;
  }
  return conversation.buyerId === userId || conversation.sellerId === userId;
}

export async function ensureSupportConversation(userId: string): Promise<Conversation> {
  const conversation = await findOrCreateConversation({
    type: "support",
    buyerId: userId,
    sellerId: DEFAULT_SUPPORT_ADMIN_ID,
    listingId: SUPPORT_LISTING_ID,
  });

  const existingMessages = await getMessages(conversation.id, { limit: 1 });
  if (existingMessages.length === 0) {
    await createMessage({
      conversationId: conversation.id,
      senderId: DEFAULT_SUPPORT_ADMIN_ID,
      body: SUPPORT_WELCOME_MESSAGE,
    });
    conversation.lastMessageAt = new Date().toISOString();
  }

  return conversation;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  await ensureSupportConversation(userId);

  let conversations: Conversation[];
  if (isFirebaseConfigured()) {
    conversations = await firestoreGetUserConversations(getServerFirestore(), userId);
  } else {
    conversations = await localGetUserConversations(userId);
  }
  return sortConversations(conversations);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  if (isFirebaseConfigured()) {
    return firestoreGetConversation(getServerFirestore(), id);
  }
  return localGetConversation(id);
}

export async function isParticipant(conversationId: string, userId: string): Promise<boolean> {
  if (isFirebaseConfigured()) {
    const conversation = await firestoreGetConversation(getServerFirestore(), conversationId);
    return conversation ? isConversationParticipant(conversation, userId) : false;
  }
  return localIsConversationParticipant(conversationId, userId);
}

export async function findOrCreateConversation(input: {
  type?: "listing" | "support";
  buyerId: string;
  sellerId: string;
  listingId: string;
}): Promise<Conversation> {
  const type = input.type ?? (input.listingId === SUPPORT_LISTING_ID ? "support" : "listing");

  if (isFirebaseConfigured()) {
    const db = getServerFirestore();
    const existing = await findConversationByParticipants(
      db,
      input.buyerId,
      input.sellerId,
      input.listingId
    );
    if (existing) return existing;

    const now = new Date().toISOString();
    const conversation: Conversation = {
      id: type === "support" ? `conv-support-${input.buyerId}` : `conv-${Date.now()}`,
      type,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      listingId: input.listingId,
      createdAt: now,
      lastMessageAt: now,
    };
    return firestoreCreateConversation(db, conversation);
  }
  return localCreateConversation({ ...input, type });
}

export async function createMessage(input: {
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl?: string | null;
}): Promise<Message> {
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

  if (isFirebaseConfigured()) {
    return firestoreCreateMessage(getServerFirestore(), message);
  }
  return localCreateMessage(input);
}

export async function getMessages(
  conversationId: string,
  options: { limit?: number; before?: string } = {}
): Promise<Message[]> {
  if (isFirebaseConfigured()) {
    return getConversationMessages(getServerFirestore(), conversationId, options);
  }
  return localGetMessages(conversationId, options);
}

export async function markMessagesRead(conversationId: string, readerId: string): Promise<number> {
  if (isFirebaseConfigured()) {
    return markConversationMessagesRead(getServerFirestore(), conversationId, readerId);
  }
  return localMarkMessagesRead(conversationId, readerId);
}

export async function countRecentMessages(senderId: string, windowMs: number): Promise<number> {
  if (isFirebaseConfigured()) {
    return countRecentMessagesBySender(getServerFirestore(), senderId, windowMs);
  }
  return localCountRecentMessages(senderId, windowMs);
}
