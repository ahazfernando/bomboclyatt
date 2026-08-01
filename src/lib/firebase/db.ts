import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { User, Admin, Listing, Event, Giveaway, BoostTransaction, Conversation, Message, ListingOffer, ListingBid } from "@/lib/types";
import { seedData } from "./seed";

export const COLLECTIONS = {
  users: "users",
  admins: "admins",
  listings: "listings",
  events: "events",
  giveaways: "giveaways",
  boostTransactions: "boostTransactions",
  conversations: "conversations",
  messages: "messages",
  listingOffers: "listingOffers",
  listingBids: "listingBids",
  meta: "meta",
} as const;

export async function ensureSeeded(db: Firestore): Promise<void> {
  const metaRef = doc(db, COLLECTIONS.meta, "app");
  const metaSnap = await getDoc(metaRef);
  if (metaSnap.exists() && metaSnap.data()?.seeded) return;

  const usersSnap = await getDocs(collection(db, COLLECTIONS.users));
  if (!usersSnap.empty) {
    await setDoc(metaRef, { seeded: true, seededAt: new Date().toISOString() });
    return;
  }

  const batch = writeBatch(db);
  for (const admin of seedData.admins) {
    batch.set(doc(db, COLLECTIONS.admins, admin.id), admin);
  }
  for (const user of seedData.users) {
    batch.set(doc(db, COLLECTIONS.users, user.id), user);
  }
  for (const listing of seedData.listings) {
    batch.set(doc(db, COLLECTIONS.listings, listing.id), listing);
  }
  for (const event of seedData.events) {
    batch.set(doc(db, COLLECTIONS.events, event.id), event);
  }
  for (const giveaway of seedData.giveaways) {
    batch.set(doc(db, COLLECTIONS.giveaways, giveaway.id), giveaway);
  }
  for (const offer of seedData.listingOffers) {
    batch.set(doc(db, COLLECTIONS.listingOffers, offer.id), offer);
  }
  for (const bid of seedData.listingBids) {
    batch.set(doc(db, COLLECTIONS.listingBids, bid.id), bid);
  }
  batch.set(metaRef, { seeded: true, seededAt: new Date().toISOString() });
  await batch.commit();
}

export async function getAllUsers(db: Firestore): Promise<User[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.users));
  return snap.docs.map((d) => d.data() as User);
}

export async function getUser(db: Firestore, id: string): Promise<User | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, id));
  return snap.exists() ? (snap.data() as User) : null;
}

export async function createUser(db: Firestore, user: User): Promise<User> {
  await setDoc(doc(db, COLLECTIONS.users, user.id), user);
  return user;
}

export async function updateUser(db: Firestore, id: string, data: Partial<User>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, id), data);
}

export async function deleteUser(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.users, id));
}

export async function getAllAdmins(db: Firestore): Promise<Admin[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.admins));
  return snap.docs.map((d) => d.data() as Admin);
}

export async function getAdmin(db: Firestore, id: string): Promise<Admin | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.admins, id));
  return snap.exists() ? (snap.data() as Admin) : null;
}

export async function createAdmin(db: Firestore, admin: Admin): Promise<Admin> {
  await setDoc(doc(db, COLLECTIONS.admins, admin.id), admin);
  return admin;
}

export async function updateAdmin(db: Firestore, id: string, data: Partial<Admin>): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.admins, id), data);
}

export async function getAllListings(db: Firestore): Promise<Listing[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.listings));
  return snap.docs.map((d) => d.data() as Listing);
}

export async function getListing(db: Firestore, id: string): Promise<Listing | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.listings, id));
  return snap.exists() ? (snap.data() as Listing) : null;
}

export async function createListing(db: Firestore, listing: Listing): Promise<Listing> {
  await setDoc(doc(db, COLLECTIONS.listings, listing.id), listing);
  return listing;
}

export async function updateListing(
  db: Firestore,
  id: string,
  data: Partial<Listing>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.listings, id), data);
}

export async function deleteListing(db: Firestore, id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTIONS.listings, id));
}

export async function getAllEvents(db: Firestore): Promise<Event[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.events));
  return snap.docs.map((d) => d.data() as Event);
}

export async function createEvent(db: Firestore, event: Event): Promise<Event> {
  await setDoc(doc(db, COLLECTIONS.events, event.id), event);
  return event;
}

export async function getAllGiveaways(db: Firestore): Promise<Giveaway[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.giveaways));
  return snap.docs.map((d) => d.data() as Giveaway);
}

export async function createGiveaway(db: Firestore, giveaway: Giveaway): Promise<Giveaway> {
  await setDoc(doc(db, COLLECTIONS.giveaways, giveaway.id), giveaway);
  return giveaway;
}

export async function updateGiveaway(
  db: Firestore,
  id: string,
  data: Partial<Giveaway>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.giveaways, id), data);
}

export async function createBoostTransaction(
  db: Firestore,
  tx: BoostTransaction
): Promise<BoostTransaction> {
  await setDoc(doc(db, COLLECTIONS.boostTransactions, tx.id), tx);
  return tx;
}

export async function getAllBoostTransactions(db: Firestore): Promise<BoostTransaction[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.boostTransactions));
  return snap.docs.map((d) => d.data() as BoostTransaction);
}

export async function createListingOffer(db: Firestore, offer: ListingOffer): Promise<ListingOffer> {
  await setDoc(doc(db, COLLECTIONS.listingOffers, offer.id), offer);
  return offer;
}

export async function updateListingOffer(
  db: Firestore,
  id: string,
  data: Partial<ListingOffer>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.listingOffers, id), data);
}

export async function createListingBid(db: Firestore, bid: ListingBid): Promise<ListingBid> {
  await setDoc(doc(db, COLLECTIONS.listingBids, bid.id), bid);
  return bid;
}

export async function getConversation(db: Firestore, id: string): Promise<Conversation | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.conversations, id));
  return snap.exists() ? (snap.data() as Conversation) : null;
}

export async function findConversationByParticipants(
  db: Firestore,
  buyerId: string,
  sellerId: string,
  listingId: string
): Promise<Conversation | null> {
  const snap = await getDocs(collection(db, COLLECTIONS.conversations));
  return (
    snap.docs
      .map((d) => d.data() as Conversation)
      .find(
        (c) => c.buyerId === buyerId && c.sellerId === sellerId && c.listingId === listingId
      ) ?? null
  );
}

export async function createConversation(
  db: Firestore,
  conversation: Conversation
): Promise<Conversation> {
  await setDoc(doc(db, COLLECTIONS.conversations, conversation.id), conversation);
  return conversation;
}

export async function updateConversation(
  db: Firestore,
  id: string,
  data: Partial<Conversation>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.conversations, id), data);
}

export async function getUserConversations(db: Firestore, userId: string): Promise<Conversation[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.conversations));
  return snap.docs
    .map((d) => d.data() as Conversation)
    .filter((c) => c.buyerId === userId || c.sellerId === userId)
    .sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt));
}

export async function createMessage(db: Firestore, message: Message): Promise<Message> {
  await setDoc(doc(db, COLLECTIONS.messages, message.id), message);
  await updateConversation(db, message.conversationId, {
    lastMessageAt: message.createdAt,
  });
  return message;
}

export async function getConversationMessages(
  db: Firestore,
  conversationId: string,
  options: { limit?: number; before?: string } = {}
): Promise<Message[]> {
  const snap = await getDocs(collection(db, COLLECTIONS.messages));
  const limit = options.limit ?? 50;
  let messages = snap.docs
    .map((d) => d.data() as Message)
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  if (options.before) {
    messages = messages.filter((m) => m.createdAt < options.before!);
  }

  return messages.slice(0, limit).reverse();
}

export async function markConversationMessagesRead(
  db: Firestore,
  conversationId: string,
  readerId: string
): Promise<number> {
  const snap = await getDocs(collection(db, COLLECTIONS.messages));
  const now = new Date().toISOString();
  let count = 0;
  const batch = writeBatch(db);

  for (const docSnap of snap.docs) {
    const message = docSnap.data() as Message;
    if (
      message.conversationId === conversationId &&
      message.senderId !== readerId &&
      !message.readAt
    ) {
      batch.update(docSnap.ref, { readAt: now });
      count++;
    }
  }

  if (count > 0) await batch.commit();
  return count;
}

export async function countRecentMessagesBySender(
  db: Firestore,
  senderId: string,
  windowMs: number
): Promise<number> {
  const cutoff = new Date(Date.now() - windowMs).toISOString();
  const snap = await getDocs(collection(db, COLLECTIONS.messages));
  return snap.docs.filter((d) => {
    const m = d.data() as Message;
    return m.senderId === senderId && m.createdAt > cutoff;
  }).length;
}
