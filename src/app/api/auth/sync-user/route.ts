import { NextResponse } from "next/server";
import { isFirebaseConfigured } from "@/lib/firebase/server";
import { syncLocalUser } from "@/lib/chat/local-users";
import type { User } from "@/lib/types";

/** Dev-only: persist user profile server-side for chat token validation without Firebase. */
export async function POST(request: Request) {
  if (isFirebaseConfigured()) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  try {
    const user = (await request.json()) as User;
    if (!user?.id || !user?.email) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }
    await syncLocalUser(user);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/auth/sync-user", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
