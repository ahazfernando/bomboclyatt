"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getFirestoreDb } from "@/lib/firebase/client";
import {
  COLLECTIONS,
  createEvent,
  createGiveaway,
  createListing,
  createUser,
  ensureSeeded,
  updateGiveaway,
  updateListing,
  updateUser,
} from "@/lib/firebase/db";
import { seedData } from "@/lib/firebase/seed";

export type Role = "buyer" | "seller" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  whatsapp?: string;
  bio?: string;
  avatar?: string;
  points: number;
  ratings: { from: string; stars: number; comment: string; date: string }[];
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  set: string;
  condition: "Mint" | "Near Mint" | "Lightly Played" | "Played";
  price: number;
  image: string;
  description: string;
  category: "Sealed Product" | "Single Hits" | "Accessories" | "Slabs" | "Comics" | "Diecast";
  sold: boolean;
  buyerId?: string;
  createdAt: string;
  reviews: { from: string; stars: number; comment: string; date: string }[];
}

export interface Event {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  date: string;
  location: string;
  cover: string;
}

export interface Giveaway {
  id: string;
  sellerId: string;
  prize: string;
  description: string;
  endsAt: string;
  cover: string;
  entrants: string[];
  winnerId?: string;
}

interface Store {
  currentUser: User | null;
  users: User[];
  listings: Listing[];
  events: Event[];
  giveaways: Giveaway[];
  loading: boolean;
  login: (email: string) => boolean;
  register: (u: Omit<User, "id" | "points" | "ratings">) => void;
  logout: () => void;
  addListing: (l: Omit<Listing, "id" | "createdAt" | "sold" | "reviews">) => void;
  markSold: (listingId: string, buyerId: string) => void;
  confirmPurchase: (listingId: string) => void;
  rateUser: (userId: string, stars: number, comment: string) => void;
  reviewListing: (listingId: string, stars: number, comment: string) => void;
  addEvent: (e: Omit<Event, "id" | "sellerId">) => void;
  addGiveaway: (g: Omit<Giveaway, "id" | "sellerId" | "entrants">) => void;
  enterGiveaway: (id: string) => void;
  drawGiveaway: (id: string) => void;
}

const LOCAL_KEY = "bomboclyatt-v1";
const SESSION = "bomboclyatt-session";
const useFirebase = isFirebaseConfigured();

function loadLocal(): Pick<Store, "users" | "listings" | "events" | "giveaways"> {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedData;
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(useFirebase);
  const [data, setData] = useState(() => seedData);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem(SESSION);

    if (!useFirebase) {
      const local = loadLocal();
      setData(local);
      if (sid) {
        const u = local.users.find((x) => x.id === sid);
        if (u) setCurrentUser(u);
      }
      setHydrated(true);
      setLoading(false);
      return;
    }

    const db = getFirestoreDb();
    let cancelled = false;
    const unsubs: (() => void)[] = [];

    void (async () => {
      try {
        await ensureSeeded(db);
        if (cancelled) return;

        unsubs.push(
          onSnapshot(collection(db, COLLECTIONS.users), (snap) => {
            const users = snap.docs.map((d) => d.data() as User);
            setData((prev) => ({ ...prev, users }));
            setLoading(false);
            setHydrated(true);
          }),
          onSnapshot(collection(db, COLLECTIONS.listings), (snap) => {
            setData((prev) => ({
              ...prev,
              listings: snap.docs.map((d) => d.data() as Listing),
            }));
          }),
          onSnapshot(collection(db, COLLECTIONS.events), (snap) => {
            setData((prev) => ({
              ...prev,
              events: snap.docs.map((d) => d.data() as Event),
            }));
          }),
          onSnapshot(collection(db, COLLECTIONS.giveaways), (snap) => {
            setData((prev) => ({
              ...prev,
              giveaways: snap.docs.map((d) => d.data() as Giveaway),
            }));
          })
        );

        if (sid) {
          const res = await fetch(`/api/users/${sid}`);
          if (res.ok) setCurrentUser(await res.json());
        }
      } catch (error) {
        console.error("Firebase init failed, falling back to local data", error);
        const local = loadLocal();
        setData(local);
        if (sid) {
          const u = local.users.find((x) => x.id === sid);
          if (u) setCurrentUser(u);
        }
        setHydrated(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      unsubs.forEach((u) => u());
    };
  }, []);

  useEffect(() => {
    if (!useFirebase && hydrated) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(data));
    }
  }, [data, hydrated]);

  useEffect(() => {
    if (currentUser) {
      const updated = data.users.find((u) => u.id === currentUser.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser)) {
        setCurrentUser(updated);
      }
    }
  }, [data.users, currentUser]);

  const persistUser = (u: User | null) => {
    setCurrentUser(u);
    if (u) localStorage.setItem(SESSION, u.id);
    else localStorage.removeItem(SESSION);
  };

  const patchListing = async (listingId: string, patch: Partial<Listing>) => {
    if (useFirebase) {
      await updateListing(getFirestoreDb(), listingId, patch);
      return;
    }
    setData((d) => ({
      ...d,
      listings: d.listings.map((l) => (l.id === listingId ? { ...l, ...patch } : l)),
    }));
  };

  const patchUser = async (userId: string, patch: Partial<User>) => {
    if (useFirebase) {
      await updateUser(getFirestoreDb(), userId, patch);
      return;
    }
    setData((d) => ({
      ...d,
      users: d.users.map((u) => (u.id === userId ? { ...u, ...patch } : u)),
    }));
  };

  const store: Store = {
    currentUser,
    loading,
    ...data,
    login: (email) => {
      const u = data.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (u) {
        persistUser(u);
        return true;
      }
      return false;
    },
    register: (u) => {
      const nu: User = { ...u, id: `u-${Date.now()}`, points: 0, ratings: [] };
      if (useFirebase) {
        void createUser(getFirestoreDb(), nu);
      } else {
        setData((d) => ({ ...d, users: [...d.users, nu] }));
      }
      persistUser(nu);
    },
    logout: () => persistUser(null),
    addListing: (l) => {
      const nl: Listing = {
        ...l,
        id: `l-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        sold: false,
        reviews: [],
      };
      if (useFirebase) {
        void createListing(getFirestoreDb(), nl);
      } else {
        setData((d) => ({ ...d, listings: [nl, ...d.listings] }));
      }
    },
    markSold: (listingId, buyerId) => {
      void patchListing(listingId, { sold: true, buyerId });
    },
    confirmPurchase: (listingId) => {
      const l = data.listings.find((x) => x.id === listingId);
      if (!l?.buyerId) return;
      const buyer = data.users.find((u) => u.id === l.buyerId);
      if (!buyer) return;
      void patchUser(buyer.id, { points: buyer.points + 10 });
      if (currentUser?.id === buyer.id) {
        setCurrentUser({ ...currentUser, points: currentUser.points + 10 });
      }
    },
    rateUser: (userId, stars, comment) => {
      if (!currentUser) return;
      const user = data.users.find((u) => u.id === userId);
      if (!user) return;
      const r = { from: currentUser.id, stars, comment, date: new Date().toISOString().slice(0, 10) };
      void patchUser(userId, { ratings: [...user.ratings, r] });
    },
    reviewListing: (listingId, stars, comment) => {
      if (!currentUser) return;
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing) return;
      const r = { from: currentUser.id, stars, comment, date: new Date().toISOString().slice(0, 10) };
      void patchListing(listingId, { reviews: [...listing.reviews, r] });
    },
    addEvent: (e) => {
      if (!currentUser) return;
      const ne: Event = { ...e, id: `e-${Date.now()}`, sellerId: currentUser.id };
      if (useFirebase) {
        void createEvent(getFirestoreDb(), ne);
      } else {
        setData((d) => ({ ...d, events: [ne, ...d.events] }));
      }
    },
    addGiveaway: (g) => {
      if (!currentUser) return;
      const ng: Giveaway = {
        ...g,
        id: `g-${Date.now()}`,
        sellerId: currentUser.id,
        entrants: [],
      };
      if (useFirebase) {
        void createGiveaway(getFirestoreDb(), ng);
      } else {
        setData((d) => ({ ...d, giveaways: [ng, ...d.giveaways] }));
      }
    },
    enterGiveaway: (id) => {
      if (!currentUser) return;
      const g = data.giveaways.find((x) => x.id === id);
      if (!g || g.entrants.includes(currentUser.id)) return;
      const entrants = [...g.entrants, currentUser.id];
      if (useFirebase) {
        void updateGiveaway(getFirestoreDb(), id, { entrants });
      } else {
        setData((d) => ({
          ...d,
          giveaways: d.giveaways.map((x) => (x.id === id ? { ...x, entrants } : x)),
        }));
      }
    },
    drawGiveaway: (id) => {
      const g = data.giveaways.find((x) => x.id === id);
      if (!g || g.entrants.length === 0) return;
      const winner = g.entrants[Math.floor(Math.random() * g.entrants.length)];
      if (useFirebase) {
        void updateGiveaway(getFirestoreDb(), id, { winnerId: winner });
      } else {
        setData((d) => ({
          ...d,
          giveaways: d.giveaways.map((x) => (x.id === id ? { ...x, winnerId: winner } : x)),
        }));
      }
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be inside StoreProvider");
  return s;
}

export function avgRating(ratings: { stars: number }[]) {
  if (!ratings.length) return 0;
  return ratings.reduce((a, r) => a + r.stars, 0) / ratings.length;
}
