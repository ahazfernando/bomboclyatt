export type UserRole = "buyer" | "seller";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  whatsapp?: string;
  bio?: string;
  avatar?: string;
  points: number;
  ratings: { from: string; stars: number; comment: string; date: string }[];
}

/** Separate entity from User — platform operators only. */
export interface Admin {
  id: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  createdAt: string;
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
  views: number;
  clicks: number;
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

export type SessionType = "user" | "admin";
