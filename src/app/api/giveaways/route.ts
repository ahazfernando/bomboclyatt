import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { createGiveaway, ensureSeeded, getAllGiveaways } from "@/lib/firebase/db";
import type { Giveaway } from "@/lib/store";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    const giveaways = await getAllGiveaways(db);
    return NextResponse.json(giveaways);
  } catch (error) {
    console.error("GET /api/giveaways", error);
    return NextResponse.json({ error: "Failed to fetch giveaways" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as Omit<Giveaway, "id">;
    const db = getServerFirestore();
    const giveaway: Giveaway = { ...body, id: `g-${Date.now()}` };
    await createGiveaway(db, giveaway);
    return NextResponse.json(giveaway, { status: 201 });
  } catch (error) {
    console.error("POST /api/giveaways", error);
    return NextResponse.json({ error: "Failed to create giveaway" }, { status: 500 });
  }
}
