import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { createUser, ensureSeeded, getAllUsers } from "@/lib/firebase/db";
import type { User } from "@/lib/types";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    const users = await getAllUsers(db);
    return NextResponse.json(users);
  } catch (error) {
    console.error("GET /api/users", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as Omit<User, "id" | "points" | "ratings">;
    const db = getServerFirestore();
    const user: User = {
      ...body,
      id: `u-${Date.now()}`,
      points: 0,
      ratings: [],
    };
    await createUser(db, user);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("POST /api/users", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
