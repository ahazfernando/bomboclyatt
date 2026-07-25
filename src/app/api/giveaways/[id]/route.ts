import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { updateGiveaway } from "@/lib/firebase/db";
import type { Giveaway } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<Giveaway>;
    const db = getServerFirestore();
    await updateGiveaway(db, id, body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("PATCH /api/giveaways/[id]", error);
    return NextResponse.json({ error: "Failed to update giveaway" }, { status: 500 });
  }
}
