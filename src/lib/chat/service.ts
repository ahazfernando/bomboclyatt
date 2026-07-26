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

export function isConversationParticipant(conversation: Conversation, userId: string): boolean {
  return conversation.buyerId === userId || conversation.sellerId === userId;
}

export async function getUserConversations(userId: string): Promise<Conversation[]> {
  if (isFirebaseConfigured()) {
    return firestoreGetUserConversations(getServerFirestore(), userId);
  }
  return localGetUserConversations(userId);
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
  buyerId: string;
  sellerId: string;
  listingId: string;
}): Promise<Conversation> {
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
      id: `conv-${Date.now()}`,
      buyerId: input.buyerId,
      sellerId: input.sellerId,
      listingId: input.listingId,
      createdAt: now,
      lastMessageAt: now,
    };
    return firestoreCreateConversation(db, conversation);
  }
  return localCreateConversation(input);
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
