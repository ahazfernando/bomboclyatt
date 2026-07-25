import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { getListing, updateListing } from "@/lib/firebase/db";
import type { Listing } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const db = getServerFirestore();
    const listing = await getListing(db, id);
    if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    return NextResponse.json(listing);
  } catch (error) {
    console.error("GET /api/listings/[id]", error);
    return NextResponse.json({ error: "Failed to fetch listing" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<Listing>;
    const db = getServerFirestore();
    await updateListing(db, id, body);
    const listing = await getListing(db, id);
    return NextResponse.json(listing);
  } catch (error) {
    console.error("PATCH /api/listings/[id]", error);
    return NextResponse.json({ error: "Failed to update listing" }, { status: 500 });
  }
}
