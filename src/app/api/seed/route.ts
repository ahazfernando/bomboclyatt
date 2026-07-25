import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { ensureSeeded } from "@/lib/firebase/db";

export async function POST() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    return NextResponse.json({ ok: true, message: "Database seeded" });
  } catch (error) {
    console.error("POST /api/seed", error);
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
}
