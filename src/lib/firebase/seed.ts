import type { User, Admin, Listing, Event, Giveaway, BoostTransaction, ListingOffer, ListingBid } from "@/lib/types";

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const seedAdmins: Admin[] = [
  {
    id: "a-1",
    name: "Ash Ketchum",
    email: "admin@bomboclyatt.com",
    bio: "Platform administrator",
    createdAt: "2026-01-01",
  },
];

export const seedUsers: User[] = [
  {
    id: "u-1",
    name: "Misty Waters",
    email: "misty@bomboclyatt.com",
    role: "seller",
    whatsapp: "15551234567",
    bio: "Vintage WOTC specialist. Ships worldwide.",
    points: 320,
    walletBalance: 50,
    ratings: [
      {
        from: "u-2",
        stars: 5,
        comment: "Fast shipping, cards exactly as described.",
        date: "2026-06-01",
      },
    ],
  },
  {
    id: "u-2",
    name: "Brock Stone",
    email: "brock@bomboclyatt.com",
    role: "seller",
    whatsapp: "15552345678",
    bio: "Modern sets, sealed product, PSA graded.",
    points: 180,
    walletBalance: 25,
    ratings: [
      { from: "u-3", stars: 4, comment: "Great communication.", date: "2026-06-10" },
    ],
  },
  {
    id: "u-3",
    name: "Erika Bloom",
    email: "erika@bomboclyatt.com",
    role: "buyer",
    whatsapp: "15553456789",
    bio: "Collecting Grass-types since 1999.",
    points: 90,
    walletBalance: 0,
    ratings: [
      { from: "u-1", stars: 5, comment: "Honest buyer, quick payment.", date: "2026-06-05" },
    ],
  },
];

export const seedListings: Listing[] = [];

export const seedEvents: Event[] = [
  {
    id: "e-1",
    sellerId: "u-1",
    title: "Vintage WOTC Meetup",
    description: "Trade night with graded card viewing.",
    date: "2026-08-14",
    location: "Cerulean City Hall",
    cover: img("photo-1511578314322-379afb476865"),
  },
  {
    id: "e-2",
    sellerId: "u-2",
    title: "Scarlet & Violet Prerelease",
    description: "Open packs, build decks, win promos.",
    date: "2026-08-22",
    location: "Pewter Gym Annex",
    cover: img("photo-1606167668584-78701c57f13d"),
  },
];

export const seedGiveaways: Giveaway[] = [
  {
    id: "g-1",
    sellerId: "u-1",
    prize: "Sealed Evolutions Booster Pack",
    description: "Free entry — winner announced live.",
    endsAt: "2026-07-30",
    cover: img("photo-1613771404721-1f92d799e49f"),
    entrants: ["u-3"],
  },
];

export const seedListingOffers: ListingOffer[] = [];

export const seedListingBids: ListingBid[] = [];

export const seedBoostTransactions: BoostTransaction[] = [];

export const seedData = {
  users: seedUsers,
  admins: seedAdmins,
  listings: seedListings,
  events: seedEvents,
  giveaways: seedGiveaways,
  boostTransactions: seedBoostTransactions,
  listingOffers: seedListingOffers,
  listingBids: seedListingBids,
};
