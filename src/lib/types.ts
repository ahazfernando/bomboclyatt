export type UserRole = "buyer" | "seller";

export interface BusinessDocument {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  /** Public handle, unique when set. */
  username?: string;
  email: string;
  role: UserRole;
  whatsapp?: string;
  bio?: string;
  avatar?: string;
  points: number;
  walletBalance?: number;
  /** Purchased verification badge. */
  verified?: boolean;
  verifiedAt?: string;
  /** Business registration / KYB documents. */
  businessDocuments?: BusinessDocument[];
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

export type ListingApprovalStatus = "pending" | "approved" | "rejected";

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  set: string;
  condition: "Mint" | "Near Mint" | "Lightly Played" | "Played";
  price: number;
  /** When set and higher than price, shown as the original price with a discount. */
  compareAtPrice?: number;
  /** Whether buyers can submit offers below list price. */
  acceptsOffers?: boolean;
  /** Whether buyers can place bids (e.g. auction-style). */
  acceptsBids?: boolean;
  /** Primary thumbnail (usually images[0]). */
  image: string;
  /** Up to 3 listing photos (URLs or data URLs). */
  images: string[];
  description: string;
  category: "Electronics" | "Games" | "TCG" | "Comics" | "Diecast";
  /** Pickup / meetup city id from MARKET_LOCATIONS. */
  location?: string;
  sold: boolean;
  buyerId?: string;
  createdAt: string;
  reviews: { from: string; stars: number; comment: string; date: string }[];
  views: number;
  clicks: number;
  /** Seller-requested / admin-managed featured placement. */
  featured?: boolean;
  /** Marketplace visibility requires admin approval. */
  approvalStatus: ListingApprovalStatus;
  boostedUntil?: string;
  boostedAt?: string;
}

export interface BoostTransaction {
  id: string;
  sellerId: string;
  listingIds: string[];
  planId: string;
  amount: number;
  createdAt: string;
}

export type OfferStatus = "pending" | "accepted" | "declined";

export interface ListingOffer {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: OfferStatus;
  createdAt: string;
}

export interface ListingBid {
  id: string;
  listingId: string;
  buyerId: string;
  amount: number;
  createdAt: string;
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

export interface Conversation {
  id: string;
  type?: "listing" | "support";
  buyerId: string;
  sellerId: string;
  listingId: string;
  createdAt: string;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
  attachmentUrl?: string | null;
  readAt?: string | null;
  createdAt: string;
}
