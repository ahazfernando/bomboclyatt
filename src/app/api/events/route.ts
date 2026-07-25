import { NextResponse } from "next/server";
import { getServerFirestore, isFirebaseConfigured } from "@/lib/firebase/server";
import { createEvent, ensureSeeded, getAllEvents } from "@/lib/firebase/db";
import type { Event } from "@/lib/store";

export async function GET() {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const db = getServerFirestore();
    await ensureSeeded(db);
    const events = await getAllEvents(db);
    return NextResponse.json(events);
  } catch (error) {
    console.error("GET /api/events", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isFirebaseConfigured()) {
    return NextResponse.json({ error: "Firebase not configured" }, { status: 503 });
  }
  try {
    const body = (await request.json()) as Omit<Event, "id">;
    const db = getServerFirestore();
    const event: Event = { ...body, id: `e-${Date.now()}` };
    await createEvent(db, event);
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("POST /api/events", error);
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}
