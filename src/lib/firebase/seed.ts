import type { User, Listing, Event, Giveaway } from "@/lib/store";

const img = (q: string) =>
  `https://images.unsplash.com/${q}?auto=format&fit=crop&w=800&q=80`;

export const seedUsers: User[] = [
  {
    id: "u-admin",
    name: "Ash Ketchum",
    email: "admin@bomboclyatt.com",
    role: "admin",
    points: 0,
    ratings: [],
  },
  {
    id: "u-1",
    name: "Misty Waters",
    email: "misty@bomboclyatt.com",
    role: "seller",
    whatsapp: "15551234567",
    bio: "Vintage WOTC specialist. Ships worldwide.",
    points: 320,
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
    ratings: [
      { from: "u-1", stars: 5, comment: "Honest buyer, quick payment.", date: "2026-06-05" },
    ],
  },
];

export const seedListings: Listing[] = [
  {
    id: "l-1",
    sellerId: "u-1",
    title: "Charizard Base Set Holo",
    set: "Base Set 1999",
    condition: "Near Mint",
    price: 4200,
    image: img("photo-1613771404784-3a5686aa7b8f"),
    description: "1st edition shadowless. Sharp corners, glossy holo.",
    category: "Single Hits",
    sold: false,
    createdAt: "2026-06-20",
    reviews: [],
  },
  {
    id: "l-2",
    sellerId: "u-1",
    title: "Blastoise Base Set",
    set: "Base Set 1999",
    condition: "Lightly Played",
    price: 850,
    image: img("photo-1628960198207-c1c8b4cd1ae1"),
    description: "Minor edge wear. Centering 55/45.",
    category: "Single Hits",
    sold: false,
    createdAt: "2026-06-22",
    reviews: [],
  },
  {
    id: "l-3",
    sellerId: "u-2",
    title: "Pikachu Illustrator Promo (Replica)",
    set: "Promo",
    condition: "Mint",
    price: 45,
    image: img("photo-1642419040728-9caed54fe0d4"),
    description: "Replica card — display only.",
    category: "Single Hits",
    sold: false,
    createdAt: "2026-06-25",
    reviews: [],
  },
  {
    id: "l-4",
    sellerId: "u-2",
    title: "Scarlet & Violet Booster Box",
    set: "SV1 2023",
    condition: "Mint",
    price: 140,
    image: img("photo-1647890055373-2ca19061a25b"),
    description: "Sealed. 36 packs. English print.",
    category: "Sealed Product",
    sold: false,
    createdAt: "2026-06-28",
    reviews: [],
  },
  {
    id: "l-5",
    sellerId: "u-1",
    title: "Mewtwo GX Rainbow Rare",
    set: "Shining Legends",
    condition: "Near Mint",
    price: 320,
    image: img("photo-1606107557195-0e29a4b5b4aa"),
    description: "Straight from pack to sleeve.",
    category: "Slabs",
    sold: false,
    createdAt: "2026-07-01",
    reviews: [],
  },
  {
    id: "l-6",
    sellerId: "u-2",
    title: "Umbreon VMAX Alt Art",
    set: "Evolving Skies",
    condition: "Mint",
    price: 590,
    image: img("photo-1541963463532-d68292c34b19"),
    description: "The moonlight chase card.",
    category: "Single Hits",
    sold: false,
    createdAt: "2026-07-03",
    reviews: [],
  },
];

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

export const seedData = {
  users: seedUsers,
  listings: seedListings,
  events: seedEvents,
  giveaways: seedGiveaways,
};
