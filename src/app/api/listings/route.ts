import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { createListing, ensureSeeded, getAllListings } from "@/lib/firebase/db";
import type { Listing } from "@/lib/types";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    const listings = await getAllListings(db);
    return NextResponse.json(listings);
  } catch (error) {
    console.error("GET /api/listings", error);
    return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as Omit<Listing, "id" | "createdAt" | "sold" | "reviews">;
    const db = getServerFirestore();
    const listing: Listing = {
      ...body,
      id: `l-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      sold: false,
      reviews: [],
    };
    await createListing(db, listing);
    return NextResponse.json(listing, { status: 201 });
  } catch (error) {
    console.error("POST /api/listings", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
