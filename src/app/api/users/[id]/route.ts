import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { getUser, updateUser } from "@/lib/firebase/db";
import type { User } from "@/lib/store";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const db = getServerFirestore();
    const user = await getUser(db, id);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("GET /api/users/[id]", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const { id } = await context.params;
    const body = (await request.json()) as Partial<User>;
    const db = getServerFirestore();
    await updateUser(db, id, body);
    const user = await getUser(db, id);
    return NextResponse.json(user);
  } catch (error) {
    console.error("PATCH /api/users/[id]", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
