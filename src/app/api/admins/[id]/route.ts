import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { getAdmin } from "@/lib/firebase/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const db = getServerFirestore();
    const admin = await getAdmin(db, id);
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    return NextResponse.json(admin);
  } catch (error) {
    console.error("GET /api/admins/[id]", error);
    return NextResponse.json({ error: "Failed to fetch admin" }, { status: 500 });
  }
}
