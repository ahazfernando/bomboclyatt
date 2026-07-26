import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { createAdmin, ensureSeeded, getAllAdmins } from "@/lib/firebase/db";
import type { Admin } from "@/lib/types";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    const admins = await getAllAdmins(db);
    return NextResponse.json(admins);
  } catch (error) {
    console.error("GET /api/admins", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as Omit<Admin, "id" | "createdAt">;
    const db = getServerFirestore();
    const admin: Admin = {
      ...body,
      id: `a-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    await createAdmin(db, admin);
    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error("POST /api/admins", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}
