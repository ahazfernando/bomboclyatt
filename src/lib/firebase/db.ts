import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { User, Listing, Event, Giveaway } from "@/lib/store";
import { seedData } from "./seed";

export const COLLECTIONS = {
  users: "users",
  listings: "listings",
  events: "events",
  giveaways: "giveaways",
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
