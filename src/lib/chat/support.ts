import type { Conversation } from "@/lib/types";

/** Sentinel listing id for platform support threads. */
export const SUPPORT_LISTING_ID = "support";

/** Default platform admin used for user support chats. */
export const DEFAULT_SUPPORT_ADMIN_ID = "a-1";

export const SUPPORT_WELCOME_MESSAGE =
  "Hi! Welcome to BomboClyatt Support. We're here to help with listings, orders, and account questions. How can we assist you today?";

export function isSupportConversation(conversation: Conversation): boolean {
  return conversation.type === "support" || conversation.listingId === SUPPORT_LISTING_ID;
}

/** Support threads always appear first in the conversation list. */
export function sortConversations(conversations: Conversation[]): Conversation[] {
  return [...conversations].sort((a, b) => {
    const aSupport = isSupportConversation(a);
    const bSupport = isSupportConversation(b);
    if (aSupport && !bSupport) return -1;
    if (!aSupport && bSupport) return 1;
    return b.lastMessageAt.localeCompare(a.lastMessageAt);
  });
}
