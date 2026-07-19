"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

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
  login: (email: string) => boolean;
  register: (u: Omit<User, "id" | "points" | "ratings">) => void;
  logout: () => void;
  addListing: (l: Omit<Listing, "id" | "createdAt" | "sold" | "reviews">) => void;
  markSold: (listingId: string, buyerId: string) => void;
  confirmPurchase: (listingId: string) => void; // buyer confirms → +points
  rateUser: (userId: string, stars: number, comment: string) => void;
  reviewListing: (listingId: string, stars: number, comment: string) => void;
  addEvent: (e: Omit<Event, "id" | "sellerId">) => void;
  addGiveaway: (g: Omit<Giveaway, "id" | "sellerId" | "entrants">) => void;
  enterGiveaway: (id: string) => void;
  drawGiveaway: (id: string) => void;
}

const seedUsers: User[] = [
  { id: "u-admin", name: "Ash Ketchum", email: "admin@emberdex.com", role: "admin", points: 0, ratings: [] },
  { id: "u-1", name: "Misty Waters", email: "misty@emberdex.com", role: "seller", whatsapp: "15551234567", bio: "Vintage WOTC specialist. Ships worldwide.", points: 320, ratings: [{ from: "u-2", stars: 5, comment: "Fast shipping, cards exactly as described.", date: "2026-06-01" }] },
  { id: "u-2", name: "Brock Stone", email: "brock@emberdex.com", role: "seller", whatsapp: "15552345678", bio: "Modern sets, sealed product, PSA graded.", points: 180, ratings: [{ from: "u-3", stars: 4, comment: "Great communication.", date: "2026-06-10" }] },
  { id: "u-3", name: "Erika Bloom", email: "erika@emberdex.com", role: "buyer", whatsapp: "15553456789", bio: "Collecting Grass-types since 1999.", points: 90, ratings: [{ from: "u-1", stars: 5, comment: "Honest buyer, quick payment.", date: "2026-06-05" }] },
];

const img = (q: string) => `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

const seedListings: Listing[] = [
  { id: "l-1", sellerId: "u-1", title: "Charizard Base Set Holo", set: "Base Set 1999", condition: "Near Mint", price: 4200, image: img("photo-1613771404784-3a5686aa7b8f"), description: "1st edition shadowless. Sharp corners, glossy holo.", category: "Single Hits", sold: false, createdAt: "2026-06-20", reviews: [] },
  { id: "l-2", sellerId: "u-1", title: "Blastoise Base Set", set: "Base Set 1999", condition: "Lightly Played", price: 850, image: img("photo-1628960198207-c1c8b4cd1ae1"), description: "Minor edge wear. Centering 55/45.", category: "Single Hits", sold: false, createdAt: "2026-06-22", reviews: [] },
  { id: "l-3", sellerId: "u-2", title: "Pikachu Illustrator Promo (Replica)", set: "Promo", condition: "Mint", price: 45, image: img("photo-1642419040728-9caed54fe0d4"), description: "Replica card — display only.", category: "Single Hits", sold: false, createdAt: "2026-06-25", reviews: [] },
  { id: "l-4", sellerId: "u-2", title: "Scarlet & Violet Booster Box", set: "SV1 2023", condition: "Mint", price: 140, image: img("photo-1647890055373-2ca19061a25b"), description: "Sealed. 36 packs. English print.", category: "Sealed Product", sold: false, createdAt: "2026-06-28", reviews: [] },
  { id: "l-5", sellerId: "u-1", title: "Mewtwo GX Rainbow Rare", set: "Shining Legends", condition: "Near Mint", price: 320, image: img("photo-1606107557195-0e29a4b5b4aa"), description: "Straight from pack to sleeve.", category: "Slabs", sold: false, createdAt: "2026-07-01", reviews: [] },
  { id: "l-6", sellerId: "u-2", title: "Umbreon VMAX Alt Art", set: "Evolving Skies", condition: "Mint", price: 590, image: img("photo-1541963463532-d68292c34b19"), description: "The moonlight chase card.", category: "Single Hits", sold: false, createdAt: "2026-07-03", reviews: [] },
];

const seedEvents: Event[] = [
  { id: "e-1", sellerId: "u-1", title: "Vintage WOTC Meetup", description: "Trade night with graded card viewing.", date: "2026-08-14", location: "Cerulean City Hall", cover: img("photo-1511578314322-379afb476865") },
  { id: "e-2", sellerId: "u-2", title: "Scarlet & Violet Prerelease", description: "Open packs, build decks, win promos.", date: "2026-08-22", location: "Pewter Gym Annex", cover: img("photo-1606167668584-78701c57f13d") },
];

const seedGiveaways: Giveaway[] = [
  { id: "g-1", sellerId: "u-1", prize: "Sealed Evolutions Booster Pack", description: "Free entry — winner announced live.", endsAt: "2026-07-30", cover: img("photo-1613771404721-1f92d799e49f"), entrants: ["u-3"] },
];

const KEY = "emberdex-v2";
const SESSION = "emberdex-session";

function load(): { users: User[]; listings: Listing[]; events: Event[]; giveaways: Giveaway[] } {
  if (typeof window === "undefined") return { users: seedUsers, listings: seedListings, events: seedEvents, giveaways: seedGiveaways };
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { users: seedUsers, listings: seedListings, events: seedEvents, giveaways: seedGiveaways };
}

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState(() => ({ users: seedUsers, listings: seedListings, events: seedEvents, giveaways: seedGiveaways }));
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const d = load();
    setData(d);
    const sid = localStorage.getItem(SESSION);
    if (sid) {
      const u = d.users.find((x) => x.id === sid);
      if (u) setCurrentUser(u);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const persistUser = (u: User | null) => {
    setCurrentUser(u);
    if (u) localStorage.setItem(SESSION, u.id);
    else localStorage.removeItem(SESSION);
  };

  const store: Store = {
    currentUser,
    ...data,
    login: (email) => {
      const u = data.users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (u) { persistUser(u); return true; }
      return false;
    },
    register: (u) => {
      const nu: User = { ...u, id: `u-${Date.now()}`, points: 0, ratings: [] };
      setData((d) => ({ ...d, users: [...d.users, nu] }));
      persistUser(nu);
    },
    logout: () => persistUser(null),
    addListing: (l) => {
      const nl: Listing = { ...l, id: `l-${Date.now()}`, createdAt: new Date().toISOString().slice(0, 10), sold: false, reviews: [] };
      setData((d) => ({ ...d, listings: [nl, ...d.listings] }));
    },
    markSold: (listingId, buyerId) => {
      setData((d) => ({ ...d, listings: d.listings.map((l) => l.id === listingId ? { ...l, sold: true, buyerId } : l) }));
    },
    confirmPurchase: (listingId) => {
      setData((d) => {
        const l = d.listings.find((x) => x.id === listingId);
        if (!l || !l.buyerId) return d;
        return {
          ...d,
          users: d.users.map((u) => u.id === l.buyerId ? { ...u, points: u.points + 10 } : u),
        };
      });
      if (currentUser) {
        setCurrentUser((cu) => cu ? { ...cu, points: cu.points + 10 } : cu);
      }
    },
    rateUser: (userId, stars, comment) => {
      if (!currentUser) return;
      const r = { from: currentUser.id, stars, comment, date: new Date().toISOString().slice(0, 10) };
      setData((d) => ({ ...d, users: d.users.map((u) => u.id === userId ? { ...u, ratings: [...u.ratings, r] } : u) }));
    },
    reviewListing: (listingId, stars, comment) => {
      if (!currentUser) return;
      const r = { from: currentUser.id, stars, comment, date: new Date().toISOString().slice(0, 10) };
      setData((d) => ({ ...d, listings: d.listings.map((l) => l.id === listingId ? { ...l, reviews: [...l.reviews, r] } : l) }));
    },
    addEvent: (e) => {
      if (!currentUser) return;
      const ne: Event = { ...e, id: `e-${Date.now()}`, sellerId: currentUser.id };
      setData((d) => ({ ...d, events: [ne, ...d.events] }));
    },
    addGiveaway: (g) => {
      if (!currentUser) return;
      const ng: Giveaway = { ...g, id: `g-${Date.now()}`, sellerId: currentUser.id, entrants: [] };
      setData((d) => ({ ...d, giveaways: [ng, ...d.giveaways] }));
    },
    enterGiveaway: (id) => {
      if (!currentUser) return;
      setData((d) => ({ ...d, giveaways: d.giveaways.map((g) => g.id === id && !g.entrants.includes(currentUser.id) ? { ...g, entrants: [...g.entrants, currentUser.id] } : g) }));
    },
    drawGiveaway: (id) => {
      setData((d) => ({
        ...d,
        giveaways: d.giveaways.map((g) => {
          if (g.id !== id || g.entrants.length === 0) return g;
          const winner = g.entrants[Math.floor(Math.random() * g.entrants.length)];
          return { ...g, winnerId: winner };
        }),
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
