import { NextResponse } from "next/server";
import { signChatToken } from "@/lib/auth/jwt";
import { isFirebaseConfigured } from "@/lib/firebase/server";
import { getUser } from "@/lib/firebase/db";
import { getServerFirestore } from "@/lib/firebase/server";
import { seedData } from "@/lib/firebase/seed";
import { getLocalUser } from "@/lib/chat/local-users";

/**
 * Issue a JWT for real-time chat and REST endpoints.
 * Validates the user exists in the database before signing.
 * Admin accounts must not use this route — only buyer/seller users.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    let userExists = false;
    if (isFirebaseConfigured()) {
      const user = await getUser(getServerFirestore(), userId);
      userExists = Boolean(user);
    } else {
      const local = await getLocalUser(userId);
      userExists = Boolean(local) || seedData.users.some((u) => u.id === userId);
    }

    if (!userExists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const token = signChatToken(userId);
    return NextResponse.json({ token, userId });
  } catch (error) {
    console.error("POST /api/auth/token", error);
    return NextResponse.json({ error: "Failed to issue token" }, { status: 500 });
  }
}
