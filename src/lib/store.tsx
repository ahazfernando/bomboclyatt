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
  createAdmin,
  deleteUser as deleteUserDoc,
  deleteListing as deleteListingDoc,
  ensureSeeded,
  updateGiveaway,
  updateListing,
  updateUser,
  createBoostTransaction,
} from "@/lib/firebase/db";
import { seedData } from "@/lib/firebase/seed";
import { calculateBoostTotal, computeBoostedUntil, type BoostPlanId } from "@/lib/boost";
import type { User, Admin, Listing, Event, Giveaway, UserRole, SessionType, BoostTransaction, ListingOffer, ListingBid, OfferStatus } from "@/lib/types";

export type { User, Admin, Listing, Event, Giveaway, UserRole, SessionType, BoostTransaction, ListingOffer, ListingBid };
export type Role = UserRole;

interface Store {
  currentUser: User | null;
  currentAdmin: Admin | null;
  sessionType: SessionType | null;
  users: User[];
  admins: Admin[];
  listings: Listing[];
  events: Event[];
  giveaways: Giveaway[];
  boostTransactions: BoostTransaction[];
  listingOffers: ListingOffer[];
  listingBids: ListingBid[];
  loading: boolean;
  login: (email: string) => boolean;
  loginAdmin: (email: string) => boolean;
  registerAdmin: (a: Omit<Admin, "id" | "createdAt">) => boolean;
  register: (u: Omit<User, "id" | "points" | "ratings">) => void;
  adminCreateUser: (u: Omit<User, "id" | "points" | "ratings">) => boolean;
  adminUpdateUser: (id: string, data: Partial<Omit<User, "id" | "ratings">>) => void;
  adminDeleteUser: (id: string) => void;
  logout: () => void;
  addListing: (l: Omit<Listing, "id" | "createdAt" | "sold" | "reviews" | "views" | "clicks">) => void;
  editListing: (id: string, data: Partial<Omit<Listing, "id" | "sellerId" | "reviews">>) => void;
  deleteListing: (id: string) => void;
  trackListingView: (listingId: string) => void;
  trackListingClick: (listingId: string) => void;
  markSold: (listingId: string, buyerId: string) => void;
  confirmPurchase: (listingId: string) => void;
  rateUser: (userId: string, stars: number, comment: string) => void;
  reviewListing: (listingId: string, stars: number, comment: string) => void;
  addEvent: (e: Omit<Event, "id" | "sellerId">) => void;
  addGiveaway: (g: Omit<Giveaway, "id" | "sellerId" | "entrants">) => void;
  enterGiveaway: (id: string) => void;
  drawGiveaway: (id: string) => void;
  boostListings: (listingIds: string[], planId: BoostPlanId) => { ok: true } | { ok: false; reason: string };
  addWalletFunds: (amount: number) => void;
  placeOffer: (listingId: string, amount: number, message?: string) => { ok: true } | { ok: false; reason: string };
  placeBid: (listingId: string, amount: number) => { ok: true } | { ok: false; reason: string };
  respondToOffer: (offerId: string, status: Exclude<OfferStatus, "pending">) => void;
}

const LOCAL_KEY = "bomboclyatt-v2";
const SESSION = "bomboclyatt-session";
const SESSION_TYPE = "bomboclyatt-session-type";
const useFirebase = isFirebaseConfigured();

export function normalizeListing(l: Listing): Listing {
  return { ...l, views: l.views ?? 0, clicks: l.clicks ?? 0 };
}

type AppData = {
  users: User[];
  admins: Admin[];
  listings: Listing[];
  events: Event[];
  giveaways: Giveaway[];
  boostTransactions: BoostTransaction[];
  listingOffers: ListingOffer[];
  listingBids: ListingBid[];
};

function loadLocal(): AppData {
  if (typeof window === "undefined") return seedData;
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppData;
      return { ...seedData, ...parsed, admins: parsed.admins ?? seedData.admins, boostTransactions: parsed.boostTransactions ?? seedData.boostTransactions, listingOffers: parsed.listingOffers ?? seedData.listingOffers, listingBids: parsed.listingBids ?? seedData.listingBids };
    }
  } catch {}
  return seedData;
}

function restoreSession(
  sid: string,
  type: SessionType | null,
  data: AppData,
  setCurrentUser: (u: User | null) => void,
  setCurrentAdmin: (a: Admin | null) => void,
  setSessionType: (t: SessionType | null) => void
) {
  if (type === "admin") {
    const admin = data.admins.find((x) => x.id === sid);
    if (admin) {
      setCurrentAdmin(admin);
      setCurrentUser(null);
      setSessionType("admin");
    }
    return;
  }
  const user = data.users.find((x) => x.id === sid);
  if (user) {
    setCurrentUser(user);
    setCurrentAdmin(null);
    setSessionType("user");
  }
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [loading, setLoading] = useState(useFirebase);
  const [data, setData] = useState<AppData>(() => seedData);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [sessionType, setSessionType] = useState<SessionType | null>(null);

  useEffect(() => {
    const sid = localStorage.getItem(SESSION);
    const stype = localStorage.getItem(SESSION_TYPE) as SessionType | null;

    if (!useFirebase) {
      const local = loadLocal();
      setData(local);
      if (sid) restoreSession(sid, stype, local, setCurrentUser, setCurrentAdmin, setSessionType);
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
          }),
          onSnapshot(collection(db, COLLECTIONS.admins), (snap) => {
            const admins = snap.docs.map((d) => d.data() as Admin);
            setData((prev) => ({ ...prev, admins }));
          }),
          onSnapshot(collection(db, COLLECTIONS.listings), (snap) => {
            setData((prev) => ({
              ...prev,
              listings: snap.docs.map((d) => normalizeListing(d.data() as Listing)),
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
          }),
          onSnapshot(collection(db, COLLECTIONS.boostTransactions), (snap) => {
            setData((prev) => ({
              ...prev,
              boostTransactions: snap.docs.map((d) => d.data() as BoostTransaction),
            }));
          })
        );

        setLoading(false);
        setHydrated(true);

        if (sid && stype === "admin") {
          const res = await fetch(`/api/admins/${sid}`);
          if (res.ok) {
            const admin = await res.json();
            setCurrentAdmin(admin);
            setCurrentUser(null);
            setSessionType("admin");
          }
        } else if (sid) {
          const res = await fetch(`/api/users/${sid}`);
          if (res.ok) {
            const user = await res.json();
            setCurrentUser(user);
            setCurrentAdmin(null);
            setSessionType("user");
          }
        }
      } catch (error) {
        console.error("Firebase init failed, falling back to local data", error);
        const local = loadLocal();
        setData(local);
        if (sid) restoreSession(sid, stype, local, setCurrentUser, setCurrentAdmin, setSessionType);
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
    if (sessionType === "user" && currentUser) {
      const updated = data.users.find((u) => u.id === currentUser.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentUser)) {
        setCurrentUser(updated);
      }
    }
    if (sessionType === "admin" && currentAdmin) {
      const updated = data.admins.find((a) => a.id === currentAdmin.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(currentAdmin)) {
        setCurrentAdmin(updated);
      }
    }
  }, [data.users, data.admins, currentUser, currentAdmin, sessionType]);

  const persistUser = (u: User | null) => {
    setCurrentUser(u);
    setCurrentAdmin(null);
    setSessionType(u ? "user" : null);
    if (u) {
      localStorage.setItem(SESSION, u.id);
      localStorage.setItem(SESSION_TYPE, "user");
      if (!useFirebase) {
        void fetch("/api/auth/sync-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(u),
        });
      }
      void fetch("/api/auth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: u.id }),
      }).then(async (res) => {
        if (res.ok) {
          const data = (await res.json()) as { token: string };
          localStorage.setItem("bomboclyatt-chat-token", data.token);
        }
      });
    } else {
      localStorage.removeItem(SESSION);
      localStorage.removeItem(SESSION_TYPE);
      localStorage.removeItem("bomboclyatt-chat-token");
    }
  };

  const persistAdmin = (a: Admin | null) => {
    setCurrentAdmin(a);
    setCurrentUser(null);
    setSessionType(a ? "admin" : null);
    if (a) {
      localStorage.setItem(SESSION, a.id);
      localStorage.setItem(SESSION_TYPE, "admin");
    } else {
      localStorage.removeItem(SESSION);
      localStorage.removeItem(SESSION_TYPE);
    }
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
    currentAdmin,
    sessionType,
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
    loginAdmin: (email) => {
      const a = data.admins.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (a) {
        persistAdmin(a);
        return true;
      }
      return false;
    },
    registerAdmin: (a) => {
      const exists = data.admins.some((x) => x.email.toLowerCase() === a.email.toLowerCase());
      if (exists) return false;
      const na: Admin = { ...a, id: `a-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10) };
      if (useFirebase) {
        void createAdmin(getFirestoreDb(), na);
      } else {
        setData((d) => ({ ...d, admins: [...d.admins, na] }));
      }
      persistAdmin(na);
      return true;
    },
    register: (u) => {
      const nu: User = { ...u, id: `u-${Date.now()}`, points: 0, walletBalance: 0, ratings: [] };
      if (useFirebase) {
        void createUser(getFirestoreDb(), nu);
      } else {
        setData((d) => ({ ...d, users: [...d.users, nu] }));
      }
      persistUser(nu);
    },
    adminCreateUser: (u) => {
      const exists = data.users.some((x) => x.email.toLowerCase() === u.email.toLowerCase());
      if (exists) return false;
      const nu: User = { ...u, id: `u-${Date.now()}`, points: 0, walletBalance: 0, ratings: [] };
      if (useFirebase) {
        void createUser(getFirestoreDb(), nu);
      } else {
        setData((d) => ({ ...d, users: [...d.users, nu] }));
      }
      return true;
    },
    adminUpdateUser: (id, patch) => {
      void patchUser(id, patch);
    },
    adminDeleteUser: (id) => {
      const userListings = data.listings.filter((l) => l.sellerId === id);
      if (useFirebase) {
        const db = getFirestoreDb();
        void deleteUserDoc(db, id);
        userListings.forEach((l) => void deleteListingDoc(db, l.id));
      } else {
        setData((d) => ({
          ...d,
          users: d.users.filter((u) => u.id !== id),
          listings: d.listings.filter((l) => l.sellerId !== id),
        }));
      }
      if (currentUser?.id === id) persistUser(null);
    },
    logout: () => {
      persistUser(null);
      persistAdmin(null);
    },
    addListing: (l) => {
      const nl: Listing = {
        ...l,
        id: `l-${Date.now()}`,
        createdAt: new Date().toISOString().slice(0, 10),
        sold: false,
        reviews: [],
        views: 0,
        clicks: 0,
      };
      if (useFirebase) {
        void createListing(getFirestoreDb(), nl);
      } else {
        setData((d) => ({ ...d, listings: [nl, ...d.listings] }));
      }
    },
    editListing: (id, patch) => {
      void patchListing(id, patch);
    },
    deleteListing: (id) => {
      if (useFirebase) {
        void deleteListingDoc(getFirestoreDb(), id);
      } else {
        setData((d) => ({ ...d, listings: d.listings.filter((l) => l.id !== id) }));
      }
    },
    trackListingView: (listingId) => {
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing || currentUser?.id === listing.sellerId) return;
      void patchListing(listingId, { views: (listing.views ?? 0) + 1 });
    },
    trackListingClick: (listingId) => {
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing || currentUser?.id === listing.sellerId) return;
      void patchListing(listingId, { clicks: (listing.clicks ?? 0) + 1 });
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
    boostListings: (listingIds, planId) => {
      if (!currentUser) return { ok: false, reason: "You must be logged in." };
      if (listingIds.length === 0) return { ok: false, reason: "Select at least one listing." };

      const owned = listingIds.filter((id) => {
        const l = data.listings.find((x) => x.id === id);
        return l && l.sellerId === currentUser.id && !l.sold;
      });
      if (owned.length !== listingIds.length) {
        return { ok: false, reason: "Some listings are invalid or already sold." };
      }

      const amount = calculateBoostTotal(listingIds.length, planId);
      const balance = currentUser.walletBalance ?? 0;
      if (balance < amount) {
        return { ok: false, reason: `Insufficient wallet balance. Need $${amount.toFixed(2)}, have $${balance.toFixed(2)}.` };
      }

      const now = new Date().toISOString();
      const tx: BoostTransaction = {
        id: `bt-${Date.now()}`,
        sellerId: currentUser.id,
        listingIds,
        planId,
        amount,
        createdAt: now,
      };

      void patchUser(currentUser.id, { walletBalance: balance - amount });
      setCurrentUser({ ...currentUser, walletBalance: balance - amount });

      for (const id of listingIds) {
        const listing = data.listings.find((l) => l.id === id)!;
        const boostedUntil = computeBoostedUntil(planId, listing.boostedUntil);
        void patchListing(id, { boostedUntil, boostedAt: now });
      }

      if (useFirebase) {
        void createBoostTransaction(getFirestoreDb(), tx);
      } else {
        setData((d) => ({
          ...d,
          boostTransactions: [tx, ...d.boostTransactions],
        }));
      }

      return { ok: true };
    },
    addWalletFunds: (amount) => {
      if (!currentUser || amount <= 0) return;
      const balance = (currentUser.walletBalance ?? 0) + amount;
      void patchUser(currentUser.id, { walletBalance: balance });
      setCurrentUser({ ...currentUser, walletBalance: balance });
    },
    placeOffer: (listingId, amount, message) => {
      if (!currentUser) return { ok: false, reason: "Sign in to make an offer." };
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing || listing.sold) return { ok: false, reason: "Listing unavailable." };
      if (listing.sellerId === currentUser.id) return { ok: false, reason: "Cannot offer on your own listing." };
      if (listing.acceptsOffers === false) return { ok: false, reason: "Seller is not accepting offers." };
      if (amount >= listing.price) return { ok: false, reason: "Offer must be below list price." };
      const hasPending = data.listingOffers.some(
        (o) => o.listingId === listingId && o.buyerId === currentUser.id && o.status === "pending"
      );
      if (hasPending) return { ok: false, reason: "You already have a pending offer on this listing." };

      const offer: ListingOffer = {
        id: `off-${Date.now()}`,
        listingId,
        buyerId: currentUser.id,
        amount,
        message,
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, listingOffers: [offer, ...d.listingOffers] }));
      return { ok: true };
    },
    placeBid: (listingId, amount) => {
      if (!currentUser) return { ok: false, reason: "Sign in to place a bid." };
      const listing = data.listings.find((l) => l.id === listingId);
      if (!listing || listing.sold) return { ok: false, reason: "Listing unavailable." };
      if (listing.sellerId === currentUser.id) return { ok: false, reason: "Cannot bid on your own listing." };
      if (listing.acceptsBids === false) return { ok: false, reason: "Seller is not accepting bids." };

      const top = data.listingBids
        .filter((b) => b.listingId === listingId)
        .sort((a, b) => b.amount - a.amount)[0];
      const min = top ? top.amount + 1 : Math.max(1, Math.floor(listing.price * 0.5));
      if (amount < min) return { ok: false, reason: `Minimum bid is ${min}.` };

      const bid: ListingBid = {
        id: `bid-${Date.now()}`,
        listingId,
        buyerId: currentUser.id,
        amount,
        createdAt: new Date().toISOString(),
      };
      setData((d) => ({ ...d, listingBids: [bid, ...d.listingBids] }));
      return { ok: true };
    },
    respondToOffer: (offerId, status) => {
      setData((d) => ({
        ...d,
        listingOffers: d.listingOffers.map((o) => (o.id === offerId ? { ...o, status } : o)),
      }));
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

export function getPostLoginPath(sessionType: SessionType | null, user: User | null): string {
  if (sessionType === "admin") return "/admin";
  if (user?.role === "seller") return "/dashboard";
  return "/dashboard";
}
